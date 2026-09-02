"""Admin bookings — `/api/v1/admin/bookings/*`. Read + capture/refund actions
for the pay-later flow."""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

import stripe
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_admin
from app.db.session import get_db
from app.integrations.stripe_gateway import (
    StripeNotConfiguredError,
    capture_payment_intent,
    get_stripe,
    refund_payment,
    retrieve_payment_intent,
)
from app.models.booking import Booking
from app.models.payment import Refund
from app.schemas.booking import AdminBookingRefundRequest, BookingOut

router = APIRouter(dependencies=[Depends(require_admin)])


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _load(db: AsyncSession, booking_id: UUID) -> Booking:
    booking = (
        await db.execute(
            select(Booking)
            .options(selectinload(Booking.extras), selectinload(Booking.payment))
            .where(Booking.id == booking_id)
        )
    ).scalar_one_or_none()
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


@router.get("", response_model=list[BookingOut])
async def list_bookings(
    db: AsyncSession = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[Booking]:
    stmt = (
        select(Booking)
        .options(selectinload(Booking.extras), selectinload(Booking.payment))
        .order_by(Booking.created_at.desc())
    )
    if status_filter:
        stmt = stmt.where(Booking.status == status_filter)
    rows = (await db.execute(stmt.limit(limit).offset(offset))).scalars().all()
    return list(rows)


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(booking_id: UUID, db: AsyncSession = Depends(get_db)) -> Booking:
    return await _load(db, booking_id)


@router.post("/{booking_id}/capture", response_model=BookingOut)
async def capture_booking(booking_id: UUID, db: AsyncSession = Depends(get_db)) -> Booking:
    booking = await _load(db, booking_id)
    payment = booking.payment
    if payment is None or payment.status != "requires_capture":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking has no authorised payment to capture",
        )
    try:
        cfg = await get_stripe(db)
        intent = await capture_payment_intent(cfg, payment.stripe_payment_intent_id)
    except StripeNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except stripe.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=exc.user_message or "Capture failed",
        )
    payment.status = "succeeded"
    payment.amount_captured = Decimal(intent.amount_received or 0) / 100
    payment.captured_at = _now()
    if booking.status != "completed":
        booking.status = "confirmed"
    await db.commit()
    await db.refresh(booking)
    return booking


@router.post("/{booking_id}/refund", response_model=BookingOut)
async def refund_booking(
    booking_id: UUID,
    payload: AdminBookingRefundRequest,
    db: AsyncSession = Depends(get_db),
) -> Booking:
    booking = await _load(db, booking_id)
    payment = booking.payment
    if payment is None or payment.status not in ("succeeded", "partially_refunded"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking has no captured payment to refund",
        )
    try:
        cfg = await get_stripe(db)
        sref = await refund_payment(
            cfg,
            intent_id=payment.stripe_payment_intent_id,
            amount=payload.amount,
            reason="requested_by_customer",
        )
    except StripeNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except stripe.StripeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=exc.user_message or "Refund failed",
        )

    amount = Decimal(sref.amount) / 100
    db.add(
        Refund(
            id=uuid4(),
            payment_id=payment.id,
            booking_id=booking.id,
            stripe_refund_id=sref.id,
            amount=amount,
            currency=booking.currency,
            reason=payload.reason,
            status=sref.status or "pending",
        )
    )
    payment.amount_refunded = (payment.amount_refunded or Decimal("0")) + amount
    payment.status = (
        "refunded" if payment.amount_refunded >= payment.amount_captured else "partially_refunded"
    )
    if payment.amount_refunded >= payment.amount_captured:
        booking.status = "cancelled"
        booking.cancelled_at = _now()

    # keep the on-file amount in sync with Stripe
    try:
        intent = await retrieve_payment_intent(cfg, payment.stripe_payment_intent_id)
        payment.amount_refunded = Decimal(getattr(intent, "amount_refunded", 0) or 0) / 100 or payment.amount_refunded
    except stripe.StripeError:
        pass

    await db.commit()
    await db.refresh(booking)
    return booking

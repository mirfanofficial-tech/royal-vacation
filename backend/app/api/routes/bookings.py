"""Public booking + payment flow — `/api/v1/bookings/*`, `/api/v1/payments/webhook`.

Guest checkout is allowed (no auth required to create a booking); a signed
`access_token` returned at creation lets a guest reopen their booking/invoice.
Payment goes through Stripe: a PaymentIntent is created with the booking, the
client confirms it with the Payment Element, and `payment_intent.*` webhooks
(plus a `/sync` fast-path) move the booking to `confirmed`.
"""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID, uuid4

import stripe
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_optional_user
from app.db.session import get_db
from app.integrations.stripe_gateway import (
    StripeNotConfiguredError,
    cancel_payment_intent,
    card_details,
    create_payment_intent,
    get_or_create_customer,
    get_stripe,
    refund_payment,
    retrieve_payment_intent,
    verify_webhook,
)
from app.models.booking import BookableRate, Booking, BookingExtra
from app.models.payment import Payment, Refund
from app.models.user import User
from app.schemas.booking import (
    BookingCancelOut,
    BookingCancelRequest,
    BookingCreate,
    BookingCreateResult,
    BookingOut,
)
from app.services.booking import (
    compute_totals,
    make_access_token,
    make_reference,
    verify_access_token,
)

router = APIRouter()

# Stripe PaymentIntent status -> our payments.status (they line up 1:1).
_PI_STATUSES = {
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
    "requires_capture",
    "succeeded",
    "canceled",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


_CENTS = Decimal("0.01")


def _quantise(value: Decimal) -> Decimal:
    return value.quantize(_CENTS)


async def _load_booking(db: AsyncSession, booking_id: UUID) -> Booking:
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


def _authorise(booking: Booking, user: User | None, token: str | None) -> None:
    if user is not None and booking.user_id == user.id:
        return
    if verify_access_token(booking.id, token):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorised for this booking")


def _apply_intent(booking: Booking, payment: Payment, intent: stripe.PaymentIntent) -> None:
    """Reconcile local rows from a (possibly expanded) Stripe PaymentIntent."""
    pi_status = intent.status if intent.status in _PI_STATUSES else payment.status
    payment.status = pi_status

    brand, last4 = card_details(intent)
    if brand:
        payment.card_brand, payment.card_last4 = brand, last4

    if pi_status == "succeeded":
        payment.amount_captured = Decimal(intent.amount_received or 0) / 100
        payment.captured_at = payment.captured_at or _now()
        payment.authorized_at = payment.authorized_at or _now()
        payment.error_message = None
        if booking.status == "pending":
            booking.status = "confirmed"
            booking.confirmed_at = _now()
    elif pi_status == "requires_capture":
        payment.authorized_at = payment.authorized_at or _now()
        payment.error_message = None
        if booking.status == "pending":
            booking.status = "confirmed"
            booking.confirmed_at = _now()
    elif pi_status == "canceled":
        if booking.status == "pending":
            booking.status = "cancelled"
            booking.cancelled_at = _now()

    last_error = getattr(intent, "last_payment_error", None)
    if last_error is not None:
        payment.error_message = getattr(last_error, "message", None) or str(last_error)


@router.post(
    "/bookings", response_model=BookingCreateResult, status_code=status.HTTP_201_CREATED
)
async def create_booking(
    payload: BookingCreate,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
) -> BookingCreateResult:
    nights = (payload.check_out - payload.check_in).days
    if nights < 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="check_out must be at least one night after check_in",
        )

    rate_key = f"{payload.property_id}:{payload.rate_plan_id}"
    rate = await db.get(BookableRate, rate_key)
    if rate is None and payload.rate_snapshot is not None:
        snap = payload.rate_snapshot
        rate = BookableRate(
            id=rate_key,
            property_id=payload.property_id,
            property_name=snap.property_name,
            room_id=snap.room_id,
            room_name=snap.room_name,
            room_image=snap.room_image,
            currency=snap.currency,
            price=snap.price,
            taxes_fees=snap.taxes_fees,
            refundable=snap.refundable,
            pay_note=None,
            cancellation=None,
            max_adults=snap.max_adults,
        )
        db.add(rate)
        await db.flush()
    if rate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="That room rate isn't available for booking",
        )
    if payload.adults > rate.max_adults:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"This rate allows at most {rate.max_adults} adult(s)",
        )

    totals, extras, promo = await compute_totals(
        db,
        rate,
        nights=nights,
        rooms=payload.rooms,
        extra_ids=payload.extra_ids,
        promo_code=payload.promo_code,
    )
    if promo is not None and promo.max_uses is not None:
        if promo.used_count >= promo.max_uses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="This promo code has reached its usage limit",
            )
        promo.used_count += 1

    payment_timing = "pay_later" if rate.refundable else "pay_now"
    capture_method = "manual" if payment_timing == "pay_later" else "automatic"

    booking_id = uuid4()
    seed = f"{payload.property_id}-{payload.rate_plan_id}-{payload.check_in}-{payload.guest.email}-{booking_id}"
    booking = Booking(
        id=booking_id,
        reference=make_reference(seed),
        user_id=user.id if user else None,
        status="pending",
        payment_timing=payment_timing,
        rate_plan_id=payload.rate_plan_id,
        property_id=rate.property_id,
        property_name=rate.property_name,
        room_id=rate.room_id,
        room_name=rate.room_name,
        room_image=rate.room_image,
        currency=rate.currency,
        check_in=payload.check_in,
        check_out=payload.check_out,
        nights=nights,
        adults=payload.adults,
        children=payload.children,
        child_ages=[a for a in payload.child_ages if 0 <= a <= 17][: payload.children],
        rooms=payload.rooms,
        guest_first_name=payload.guest.first_name,
        guest_last_name=payload.guest.last_name,
        guest_email=payload.guest.email,
        guest_dial_code=payload.guest.dial_code,
        guest_phone=payload.guest.phone,
        guest_country=payload.guest.country,
        booking_for=payload.guest.booking_for,
        arrival_time=payload.guest.arrival_time,
        special_requests=payload.guest.special_requests,
        nights_subtotal=totals.nights_subtotal,
        extras_total=totals.extras_total,
        taxes_fees=totals.taxes_fees,
        service_fee=totals.service_fee,
        promo_code=totals.promo_code,
        promo_discount=totals.promo_discount,
        total_amount=totals.total_amount,
    )
    booking.extras = [
        BookingExtra(extra_id=e["extra_id"], title=e["title"], price=e["price"]) for e in extras
    ]
    db.add(booking)

    try:
        cfg = await get_stripe(db)
        customer_name = f"{payload.guest.first_name} {payload.guest.last_name or ''}".strip()
        customer_id = await get_or_create_customer(
            cfg, email=payload.guest.email, name=customer_name
        )
        intent = await create_payment_intent(
            cfg,
            amount=totals.total_amount,
            currency=rate.currency,
            capture_method=capture_method,
            customer_id=customer_id,
            metadata={"booking_id": str(booking_id), "reference": booking.reference},
        )
    except StripeNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except stripe.StripeError as exc:  # pragma: no cover - passthrough
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=exc.user_message or "Payment provider error",
        )

    db.add(
        Payment(
            booking_id=booking_id,
            gateway="stripe",
            stripe_payment_intent_id=intent.id,
            stripe_customer_id=customer_id,
            status=intent.status if intent.status in _PI_STATUSES else "requires_payment_method",
            capture_method=capture_method,
            amount=totals.total_amount,
            currency=rate.currency,
        )
    )
    await db.commit()

    return BookingCreateResult(
        booking_id=booking_id,
        reference=booking.reference,
        access_token=make_access_token(booking_id),
        payment_timing=payment_timing,
        client_secret=intent.client_secret,
        publishable_key=cfg.publishable_key,
        totals=totals,
    )


@router.get("/bookings", response_model=list[BookingOut])
async def list_my_bookings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Booking]:
    rows = (
        await db.execute(
            select(Booking)
            .options(selectinload(Booking.extras), selectinload(Booking.payment))
            .where(Booking.user_id == user.id)
            .order_by(Booking.created_at.desc())
        )
    ).scalars().all()
    return list(rows)


@router.get("/bookings/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    token: str | None = Query(default=None),
) -> Booking:
    booking = await _load_booking(db, booking_id)
    _authorise(booking, user, token)
    return booking


@router.post("/bookings/{booking_id}/sync", response_model=BookingOut)
async def sync_booking(
    booking_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    token: str | None = Query(default=None),
) -> Booking:
    booking = await _load_booking(db, booking_id)
    _authorise(booking, user, token)
    if booking.payment is None:
        return booking
    try:
        cfg = await get_stripe(db)
        intent = await retrieve_payment_intent(cfg, booking.payment.stripe_payment_intent_id)
    except StripeNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    except stripe.StripeError:
        return booking
    _apply_intent(booking, booking.payment, intent)
    await db.commit()
    await db.refresh(booking)
    return booking


async def _cancellation_breakdown(
    booking: Booking, rate: BookableRate
) -> tuple[Decimal, Decimal]:
    """(refund_amount, kept_amount) for a cancellation, per rate policy.

    Refundable rates cancel for free. Non-refundable rates keep the first
    night(+service fee) and refund the rest — a Booking.com-style penalty.
    """
    total = Decimal(booking.total_amount)
    if not rate.refundable:
        first_night = (Decimal(booking.nights_subtotal) / max(Decimal(booking.nights), Decimal(1)))
        kept = first_night + Decimal(booking.service_fee)
        refund = total - kept
        if refund < Decimal("0"):
            refund = Decimal("0")
        return _quantise(refund), _quantise(kept)
    return Decimal(booking.total_amount), Decimal("0")


@router.post("/bookings/{booking_id}/cancel", response_model=BookingCancelOut)
async def cancel_booking(
    booking_id: UUID,
    payload: BookingCancelRequest,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_optional_user),
    token: str | None = Query(default=None),
) -> BookingCancelOut:
    booking = await _load_booking(db, booking_id)
    _authorise(booking, user, token)

    if booking.status in ("cancelled", "completed", "no_show"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This booking can no longer be cancelled",
        )

    rate = await db.get(BookableRate, booking.rate_plan_id)
    refundable = rate.refundable if rate is not None else True
    held_to_pay = booking.payment_timing == "pay_later"
    total = Decimal(booking.total_amount)
    refund_amount, kept_amount = _cancellation_breakdown(booking, rate)

    if booking.payment is not None:
        pay = booking.payment
        if pay.amount_captured and refund_amount > Decimal("0"):
            cfg = await get_stripe(db)
            try:
                sref = await refund_payment(
                    cfg,
                    intent_id=pay.stripe_payment_intent_id,
                    amount=refund_amount,
                    reason="requested_by_customer",
                )
            except StripeNotConfiguredError as exc:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
            except stripe.StripeError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=exc.user_message or "Refund failed",
                )
            db.add(
                Refund(
                    id=uuid4(),
                    payment_id=pay.id,
                    booking_id=booking.id,
                    stripe_refund_id=sref.id,
                    amount=refund_amount,
                    currency=booking.currency,
                    reason=payload.reason or "requested_by_customer",
                    status=sref.status or "pending",
                )
            )
            pay.amount_refunded = (pay.amount_refunded or Decimal("0")) + refund_amount
            pay.status = (
                "refunded"
                if pay.amount_refunded >= (pay.amount_captured or Decimal("0"))
                else "partially_refunded"
            )
        elif pay.status in ("requires_capture", "requires_confirmation", "processing", "requires_action"):
            # Authorised/hold but not yet captured — release the hold, no refund.
            try:
                cfg = await get_stripe(db)
                await cancel_payment_intent(cfg, pay.stripe_payment_intent_id)
                pay.status = "canceled"
            except (StripeNotConfiguredError, stripe.StripeError):
                pass

    booking.status = "cancelled"
    booking.cancelled_at = _now()
    await db.commit()
    await db.refresh(booking)

    return BookingCancelOut(
        booking=BookingOut.model_validate(booking),
        status="cancelled",
        refundable=refundable,
        refund_amount=refund_amount,
        refund_currency=booking.currency,
        original_total=total,
        kept_amount=kept_amount,
        held_to_pay=held_to_pay,
        cancelled_at=booking.cancelled_at,
    )


@router.post("/payments/webhook", include_in_schema=False)
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        cfg = await get_stripe(db)
    except StripeNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    if not cfg.webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe webhook secret not configured",
        )

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = verify_webhook(payload, sig, cfg.webhook_secret)
    except (ValueError, stripe.SignatureVerificationError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    obj = event["data"]["object"]
    handled = {
        "payment_intent.succeeded",
        "payment_intent.amount_capturable_updated",
        "payment_intent.payment_failed",
        "payment_intent.canceled",
        "charge.refunded",
    }
    if event["type"] not in handled:
        return {"received": True, "ignored": event["type"]}

    intent_id = obj.get("payment_intent") if event["type"] == "charge.refunded" else obj.get("id")
    payment = (
        await db.execute(
            select(Payment).where(Payment.stripe_payment_intent_id == intent_id)
        )
    ).scalar_one_or_none()
    if payment is None:
        return {"received": True, "unknown_payment_intent": intent_id}

    booking = await _load_booking(db, payment.booking_id)

    if event["type"] == "charge.refunded":
        refunded = Decimal(obj.get("amount_refunded", 0)) / 100
        payment.amount_refunded = refunded
        payment.status = "refunded" if obj.get("refunded") else "partially_refunded"
    elif event["type"] == "payment_intent.payment_failed":
        payment.status = "failed"
        err = obj.get("last_payment_error") or {}
        payment.error_message = err.get("message")
    else:
        # succeeded / amount_capturable_updated / canceled — re-pull expanded
        # so we get card details + amount_received.
        try:
            intent = await retrieve_payment_intent(cfg, payment.stripe_payment_intent_id)
            _apply_intent(booking, payment, intent)
        except stripe.StripeError:
            pass

    await db.commit()
    return {"received": True}

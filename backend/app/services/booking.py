"""Booking pricing + guest-access token.

Pricing mirrors the figures shown on the website checkout
(`client/src/components/checkout/booking-summary-card.tsx`) so the amount we
charge matches what the guest saw. The server is authoritative — the rate comes
from `bookable_rates`, extras/fees from the constants in
`app/schemas/booking.py`.
"""

from __future__ import annotations

import hashlib
import hmac
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from app.core.config import settings
from app.models.booking import BookableRate
from app.schemas.booking import EXTRAS, PROMO_CODES, SERVICE_FEE, TAX_RATE, BookingTotals

_CENTS = Decimal("0.01")


def _round(value: Decimal) -> Decimal:
    return value.quantize(_CENTS, rounding=ROUND_HALF_UP)


def resolve_extras(extra_ids: list[str]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for eid in extra_ids:
        if eid in EXTRAS and eid not in seen:
            seen.add(eid)
            out.append({"extra_id": eid, "title": EXTRAS[eid]["title"], "price": EXTRAS[eid]["price"]})
    return out


def compute_totals(
    rate: BookableRate,
    *,
    nights: int,
    rooms: int,
    extra_ids: list[str],
    promo_code: str | None,
) -> tuple[BookingTotals, list[dict]]:
    extras = resolve_extras(extra_ids)
    nights_subtotal = _round(Decimal(rate.price) * nights * rooms)
    extras_total = _round(sum((e["price"] for e in extras), Decimal("0")))
    taxes_fees = _round((nights_subtotal + extras_total) * TAX_RATE)
    service_fee = SERVICE_FEE

    code = (promo_code or "").strip().upper() or None
    promo_discount = PROMO_CODES.get(code, Decimal("0")) if code else Decimal("0")
    matched_code = code if promo_discount > 0 else None

    total = nights_subtotal + extras_total + taxes_fees + service_fee - promo_discount
    if total < 0:
        total = Decimal("0")

    totals = BookingTotals(
        currency=rate.currency,
        nights=nights,
        nights_subtotal=nights_subtotal,
        extras_total=extras_total,
        taxes_fees=taxes_fees,
        service_fee=service_fee,
        promo_code=matched_code,
        promo_discount=promo_discount,
        total_amount=_round(total),
    )
    return totals, extras


def make_access_token(booking_id: UUID) -> str:
    return hmac.new(
        settings.secret_key.encode(), str(booking_id).encode(), hashlib.sha256
    ).hexdigest()


def verify_access_token(booking_id: UUID, token: str | None) -> bool:
    if not token:
        return False
    return hmac.compare_digest(make_access_token(booking_id), token)


def make_reference(seed: str) -> str:
    n = int(hashlib.sha256(f"booking-{seed}".encode()).hexdigest(), 16) % 100000
    return f"RV-2026-{n:05d}"

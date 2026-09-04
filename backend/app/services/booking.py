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
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.booking import BookableRate
from app.models.promo_code import PromoCode
from app.models.reference import Currency
from app.schemas.booking import EXTRAS, SERVICE_FEE, TAX_RATE, BookingTotals

_CENTS = Decimal("0.01")


def _round(value: Decimal) -> Decimal:
    return value.quantize(_CENTS, rounding=ROUND_HALF_UP)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def resolve_extras(extra_ids: list[str]) -> list[dict]:
    seen: set[str] = set()
    out: list[dict] = []
    for eid in extra_ids:
        if eid in EXTRAS and eid not in seen:
            seen.add(eid)
            out.append({"extra_id": eid, "title": EXTRAS[eid]["title"], "price": EXTRAS[eid]["price"]})
    return out


async def resolve_promo_code(
    db: AsyncSession, promo_code: str | None, now: datetime | None = None
) -> PromoCode | None:
    """Look up a valid, currently redeemable promo code row (or None).

    Eligibility: active, within any starts/expiry window, and (if limited)
    not yet at its usage cap.
    """
    code = (promo_code or "").strip().upper() or None
    if not code:
        return None
    now = now or _now()
    row = (
        await db.execute(select(PromoCode).where(PromoCode.code == code))
    ).scalar_one_or_none()
    if row is None:
        return None
    if not row.is_active:
        return None
    if row.starts_at is not None and row.starts_at > now:
        return None
    if row.expires_at is not None and row.expires_at < now:
        return None
    if row.max_uses is not None and row.used_count >= row.max_uses:
        return None
    return row


async def _currency_rates(db: AsyncSession, codes: list[str]) -> dict[str, Decimal]:
    codes = [c for c in codes if c]
    if not codes:
        return {}
    rows = (
        await db.execute(select(Currency).where(Currency.code.in_(codes)))
    ).scalars().all()
    return {r.code: r.rate_to_aed for r in rows}


def convert_amount(
    amount: Decimal, from_currency: str, to_currency: str, rates: dict[str, Decimal]
) -> Decimal | None:
    """Convert ``amount`` from one currency to another via rate_to_aed (or ``None`` if unknown).

    ``rate_to_aed`` is defined as "1 unit of currency X = rate_to_aed AED", so an
    amount in currency X equals ``amount * rate_to_aed`` AED, and an amount in AED
    equals ``amount / rate_to_aed`` units of currency X.
    """
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()
    if from_currency == to_currency:
        return amount
    rate_from = rates.get(from_currency)
    rate_to = rates.get(to_currency)
    if not rate_from or not rate_to or rate_to == 0:
        return None
    amount_aed = amount * rate_from
    return amount_aed / rate_to


def _promo_discount(
    promo: PromoCode | None,
    subtotal: Decimal,
    pre_discount_total: Decimal,
    currency: str,
    rates: dict[str, Decimal],
) -> Decimal:
    """Percentage-based discount with a min-spend gate and max-discount cap."""
    if promo is None:
        return Decimal("0")

    discount = subtotal * (promo.discount_percent / Decimal("100"))

    if (
        promo.min_spend_amount is not None
        and promo.min_spend_currency is not None
    ):
        min_spend = convert_amount(
            promo.min_spend_amount, promo.min_spend_currency, currency, rates
        )
        if min_spend is not None and pre_discount_total < min_spend:
            return Decimal("0")

    if (
        promo.max_discount_amount is not None
        and promo.max_discount_currency is not None
    ):
        cap = convert_amount(
            promo.max_discount_amount, promo.max_discount_currency, currency, rates
        )
        if cap is not None:
            discount = min(discount, cap)

    discount = min(discount, pre_discount_total)
    return _round(discount)


async def compute_totals(
    db: AsyncSession,
    rate: BookableRate,
    *,
    nights: int,
    rooms: int,
    extra_ids: list[str],
    promo_code: str | None,
) -> tuple[BookingTotals, list[dict], PromoCode | None]:
    extras = resolve_extras(extra_ids)
    nights_subtotal = _round(Decimal(rate.price) * nights * rooms)
    extras_total = _round(sum((e["price"] for e in extras), Decimal("0")))
    taxes_fees = _round((nights_subtotal + extras_total) * TAX_RATE)
    service_fee = SERVICE_FEE
    subtotal = nights_subtotal + extras_total
    pre_discount_total = subtotal + taxes_fees + service_fee

    promo = await resolve_promo_code(db, promo_code)

    promo_currencies = []
    if promo is not None:
        promo_currencies = [
            promo.max_discount_currency,
            promo.min_spend_currency,
            rate.currency,
        ]
    rates = await _currency_rates(db, promo_currencies)

    promo_discount = _promo_discount(
        promo, subtotal, pre_discount_total, rate.currency, rates
    )
    matched_code = promo.code if (promo is not None and promo_discount > 0) else None

    total = _round(pre_discount_total - promo_discount)

    totals = BookingTotals(
        currency=rate.currency,
        nights=nights,
        nights_subtotal=nights_subtotal,
        extras_total=extras_total,
        taxes_fees=taxes_fees,
        service_fee=service_fee,
        promo_code=matched_code,
        promo_discount=promo_discount,
        total_amount=total,
    )
    return totals, extras, promo


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

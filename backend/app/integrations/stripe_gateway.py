"""Stripe wrapper for the checkout payment flow.

Credentials come from the `payment_gateways` row with `code = 'stripe'` (added
through the admin Payment Gateways UI), decrypted the same way the rest of the
integration layer reads its secrets. The Stripe SDK is synchronous, so every
call is pushed to a threadpool to keep the event loop free.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

import stripe
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.crypto import decrypt_json
from app.models.payment import PaymentGateway


class StripeNotConfiguredError(Exception):
    """No usable `stripe` gateway row / missing secret key."""


@dataclass
class StripeConfig:
    secret_key: str
    publishable_key: str | None
    webhook_secret: str | None
    client: stripe.StripeClient


async def get_stripe(db: AsyncSession) -> StripeConfig:
    row = (
        await db.execute(select(PaymentGateway).where(PaymentGateway.code == "stripe"))
    ).scalar_one_or_none()
    if row is None:
        raise StripeNotConfiguredError("No 'stripe' payment gateway is configured")
    if row.status == "inactive":
        raise StripeNotConfiguredError("The 'stripe' payment gateway is inactive")

    creds = decrypt_json(row.credentials_encrypted)
    secret_key = creds.get("secret_key")
    if not secret_key:
        raise StripeNotConfiguredError("The 'stripe' gateway has no secret key configured")

    return StripeConfig(
        secret_key=secret_key,
        publishable_key=creds.get("public_key"),
        webhook_secret=creds.get("webhook_secret"),
        client=stripe.StripeClient(secret_key),
    )


def to_minor_units(amount: Decimal | float | int) -> int:
    """AED 123.45 -> 12345 (Stripe works in the currency's smallest unit)."""
    return int((Decimal(str(amount)) * 100).quantize(Decimal("1")))


async def get_or_create_customer(cfg: StripeConfig, *, email: str, name: str) -> str:
    existing = await run_in_threadpool(
        cfg.client.customers.list, params={"email": email, "limit": 1}
    )
    if existing.data:
        return existing.data[0].id
    created = await run_in_threadpool(
        cfg.client.customers.create, params={"email": email, "name": name}
    )
    return created.id


async def create_payment_intent(
    cfg: StripeConfig,
    *,
    amount: Decimal | float,
    currency: str,
    capture_method: str,  # "automatic" | "manual"
    customer_id: str,
    metadata: dict[str, str],
) -> stripe.PaymentIntent:
    return await run_in_threadpool(
        cfg.client.payment_intents.create,
        params={
            "amount": to_minor_units(amount),
            "currency": currency.lower(),
            "capture_method": capture_method,
            "customer": customer_id,
            "metadata": metadata,
            "automatic_payment_methods": {"enabled": True},
        },
    )


async def retrieve_payment_intent(cfg: StripeConfig, intent_id: str) -> stripe.PaymentIntent:
    return await run_in_threadpool(
        cfg.client.payment_intents.retrieve,
        intent_id,
        params={"expand": ["latest_charge", "latest_charge.payment_method_details"]},
    )


async def capture_payment_intent(
    cfg: StripeConfig, intent_id: str, *, amount: Decimal | float | None = None
) -> stripe.PaymentIntent:
    params: dict = {}
    if amount is not None:
        params["amount_to_capture"] = to_minor_units(amount)
    return await run_in_threadpool(
        cfg.client.payment_intents.capture, intent_id, params=params
    )


async def refund_payment(
    cfg: StripeConfig,
    *,
    intent_id: str,
    amount: Decimal | float | None,
    reason: str | None,
) -> stripe.Refund:
    params: dict = {"payment_intent": intent_id}
    if amount is not None:
        params["amount"] = to_minor_units(amount)
    if reason in ("duplicate", "fraudulent", "requested_by_customer"):
        params["reason"] = reason
    return await run_in_threadpool(cfg.client.refunds.create, params=params)


def verify_webhook(payload: bytes, sig_header: str, secret: str) -> stripe.Event:
    """Raises stripe.error.SignatureVerificationError on a bad signature."""
    return stripe.Webhook.construct_event(payload, sig_header, secret)


def card_details(intent: stripe.PaymentIntent) -> tuple[str | None, str | None]:
    """(brand, last4) from an expanded PaymentIntent, or (None, None)."""
    charge = getattr(intent, "latest_charge", None)
    if charge is None or isinstance(charge, str):
        return None, None
    pmd = getattr(charge, "payment_method_details", None)
    card = getattr(pmd, "card", None) if pmd else None
    if card is None:
        return None, None
    return getattr(card, "brand", None), getattr(card, "last4", None)

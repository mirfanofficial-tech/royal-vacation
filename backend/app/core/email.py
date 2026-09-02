"""Outbound transactional email (OTP codes, welcome).

Real send only when SMTP is configured (`settings.email_enabled`); otherwise a
no-op returning False so callers can fall back to a dev code. A send failure is
logged and swallowed — it must never break the request that triggered it.
"""

from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    *, to: str, subject: str, text: str, html: str | None = None
) -> bool:
    if not settings.email_enabled:
        logger.info("email disabled — skipping send to %s (%r)", to, subject)
        return False

    message = EmailMessage()
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from}>"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(text)
    if html:
        message.add_alternative(html, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_password or None,
            start_tls=settings.smtp_port == 587,
            use_tls=settings.smtp_port == 465,
            timeout=15,
        )
        return True
    except Exception:  # noqa: BLE001 - never propagate email failures
        logger.exception("failed to send email to %s", to)
        return False


async def send_otp_email(to: str, code: str) -> bool:
    return await send_email(
        to=to,
        subject=f"{code} is your Royal Vacation verification code",
        text=(
            f"Your verification code is {code}.\n\n"
            "It expires in 10 minutes. If you didn't request this, ignore this email."
        ),
    )


async def send_welcome_email(to: str, first_name: str | None) -> bool:
    name = first_name or "there"
    return await send_email(
        to=to,
        subject="Your Royal Vacation account is ready",
        text=(
            f"Hi {name},\n\n"
            "Your Royal Vacation account has been created against this email address.\n"
            f"You can manage your bookings and profile any time at {settings.public_web_url}/account.\n\n"
            "To sign in later, use this email and request a one-time code.\n"
        ),
    )

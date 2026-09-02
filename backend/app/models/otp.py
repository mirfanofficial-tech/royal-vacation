from datetime import datetime

from sqlalchemy import DateTime, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class EmailOtp(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    """A short-lived email verification code used by the checkout OTP flow
    (and passwordless sign-in). Profile hints are captured at request time so
    account creation on verify has real data."""

    __tablename__ = "email_otps"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    code_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    attempts: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)

    first_name: Mapped[str | None] = mapped_column(String(120))
    last_name: Mapped[str | None] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(40))
    country: Mapped[str | None] = mapped_column(String(2))

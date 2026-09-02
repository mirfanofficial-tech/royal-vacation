from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class PaymentGateway(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "payment_gateways"

    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'test'"),
        nullable=False,
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    currencies: Mapped[list[str]] = mapped_column(
        JSONB,
        server_default=text("'[]'::jsonb"),
        nullable=False,
    )
    # Fernet-encrypted JSON blob — see app/core/crypto.py. Never queried,
    # never returned as-is; routes decrypt server-side and mask before
    # serializing a response.
    credentials_encrypted: Mapped[str | None] = mapped_column(Text)
    success_url: Mapped[str | None] = mapped_column(Text)
    cancel_url: Mapped[str | None] = mapped_column(Text)
    webhook_url: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'test', 'inactive')",
            name="payment_gateways_status_check",
        ),
        Index(
            "uq_payment_gateways_default",
            "is_default",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )


PAYMENT_STATUSES = (
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
    "requires_capture",
    "succeeded",
    "failed",
    "canceled",
    "refunded",
    "partially_refunded",
)


class Payment(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    """A payment attempt against a booking, tracked alongside its Stripe
    PaymentIntent. One row per booking (created with the PaymentIntent)."""

    __tablename__ = "payments"

    booking_id: Mapped[UUID] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    gateway: Mapped[str] = mapped_column(String(40), server_default=text("'stripe'"), nullable=False)
    stripe_payment_intent_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(
        String(30), server_default=text("'requires_payment_method'"), nullable=False
    )
    capture_method: Mapped[str] = mapped_column(
        String(20), server_default=text("'automatic'"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    amount_captured: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    amount_refunded: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    card_brand: Mapped[str | None] = mapped_column(String(40))
    card_last4: Mapped[str | None] = mapped_column(String(4))
    error_message: Mapped[str | None] = mapped_column(Text)

    authorized_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    booking: Mapped["Booking"] = relationship(back_populates="payment")  # noqa: F821
    refunds: Mapped[list["Refund"]] = relationship(
        back_populates="payment", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        CheckConstraint(
            "capture_method IN ('automatic', 'manual')",
            name="payments_capture_method_check",
        ),
    )


class Refund(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "payment_refunds"

    payment_id: Mapped[UUID] = mapped_column(
        ForeignKey("payments.id", ondelete="CASCADE"), nullable=False
    )
    booking_id: Mapped[UUID] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    stripe_refund_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(30), server_default=text("'pending'"), nullable=False)

    payment: Mapped["Payment"] = relationship(back_populates="refunds")

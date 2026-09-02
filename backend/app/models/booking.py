from datetime import date, datetime
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin, UpdatedAtMixin

BOOKING_STATUSES = ("pending", "confirmed", "cancelled", "completed", "no_show")
PAYMENT_TIMINGS = ("pay_now", "pay_later")


class BookableRate(CreatedAtMixin, UpdatedAtMixin, Base):
    """Server-authoritative price for a room + rate plan.

    Temporary: seeded from `client/src/lib/property-detail-mock-data.ts` until
    the live rates layer (RateHawk / Vervotech) replaces it. `id` matches the
    mock rate-plan id so the client can keep rendering from its own data.
    """

    __tablename__ = "bookable_rates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    property_id: Mapped[str] = mapped_column(String(64), nullable=False)
    property_name: Mapped[str] = mapped_column(String(255), nullable=False)
    room_id: Mapped[str] = mapped_column(String(64), nullable=False)
    room_name: Mapped[str] = mapped_column(String(255), nullable=False)
    room_image: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    taxes_fees: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    refundable: Mapped[bool] = mapped_column(Boolean, server_default="true", nullable=False)
    pay_note: Mapped[str | None] = mapped_column(String(255))
    cancellation: Mapped[str | None] = mapped_column(String(255))
    max_adults: Mapped[int] = mapped_column(Integer, server_default="2", nullable=False)


class Booking(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "bookings"

    reference: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    status: Mapped[str] = mapped_column(
        String(20), server_default="pending", nullable=False
    )
    payment_timing: Mapped[str] = mapped_column(String(20), nullable=False)

    # Rate snapshot at booking time.
    rate_plan_id: Mapped[str] = mapped_column(String(64), nullable=False)
    property_id: Mapped[str] = mapped_column(String(64), nullable=False)
    property_name: Mapped[str] = mapped_column(String(255), nullable=False)
    room_id: Mapped[str] = mapped_column(String(64), nullable=False)
    room_name: Mapped[str] = mapped_column(String(255), nullable=False)
    room_image: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    currency: Mapped[str] = mapped_column(String(3), nullable=False)

    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, server_default="2", nullable=False)
    children: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    child_ages: Mapped[list[int]] = mapped_column(
        JSONB, server_default=text("'[]'::jsonb"), nullable=False
    )
    rooms: Mapped[int] = mapped_column(Integer, server_default="1", nullable=False)

    guest_first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    guest_last_name: Mapped[str | None] = mapped_column(String(120))
    guest_email: Mapped[str] = mapped_column(String(255), nullable=False)
    guest_dial_code: Mapped[str | None] = mapped_column(String(8))
    guest_phone: Mapped[str | None] = mapped_column(String(40))
    guest_country: Mapped[str | None] = mapped_column(String(2))
    booking_for: Mapped[str] = mapped_column(
        String(20), server_default="main_guest", nullable=False
    )
    arrival_time: Mapped[str | None] = mapped_column(String(20))
    special_requests: Mapped[str | None] = mapped_column(Text)

    nights_subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    extras_total: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    taxes_fees: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    service_fee: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    promo_code: Mapped[str | None] = mapped_column(String(40))
    promo_discount: Mapped[float] = mapped_column(Numeric(12, 2), server_default="0", nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    extras: Mapped[list["BookingExtra"]] = relationship(
        back_populates="booking", cascade="all, delete-orphan", lazy="selectin"
    )
    payment: Mapped["Payment | None"] = relationship(
        back_populates="booking", uselist=False, lazy="selectin"
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')",
            name="bookings_status_check",
        ),
        CheckConstraint(
            "payment_timing IN ('pay_now', 'pay_later')",
            name="bookings_payment_timing_check",
        ),
    )


class BookingExtra(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "booking_extras"

    booking_id: Mapped[UUID] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    extra_id: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    booking: Mapped["Booking"] = relationship(back_populates="extras")


# Late import to avoid a cycle — Payment lives in payment.py and back-populates
# Booking.payment.
from app.models.payment import Payment  # noqa: E402  (bottom import is intentional)

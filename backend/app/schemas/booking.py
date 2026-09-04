from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Extras catalogue — mirrors client/src/lib/checkout-mock-data.ts. The server
# is the source of truth for prices; the client id is all we trust from input.
EXTRAS: dict[str, dict] = {
    "breakfast": {"title": "Breakfast", "price": Decimal("4000")},
    "airport-pickup": {"title": "Airport Pickup", "price": Decimal("6500")},
    "travel-insurance": {"title": "Travel Insurance", "price": Decimal("2800")},
}

SERVICE_FEE = Decimal("2750")
TAX_RATE = Decimal("0.15")


class GuestInfo(BaseModel):
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    email: EmailStr
    dial_code: str | None = Field(default=None, max_length=8)
    phone: str | None = Field(default=None, max_length=40)
    country: str | None = Field(default=None, max_length=2)
    booking_for: str = Field(default="main_guest")
    arrival_time: str | None = Field(default=None, max_length=20)
    special_requests: str | None = Field(default=None, max_length=1000)


class RateSnapshot(BaseModel):
    """Fallback rate details for properties not yet in `bookable_rates`
    (synthesized demo listings). Used only when no seeded rate matches;
    persisted as a `bookable_rates` row so the amount stays server-owned.
    Real seeded rows always take precedence."""

    property_name: str = Field(min_length=1, max_length=255)
    room_id: str = Field(min_length=1, max_length=64)
    room_name: str = Field(min_length=1, max_length=255)
    room_image: str | None = None
    currency: str = Field(min_length=3, max_length=3)
    price: Decimal = Field(gt=0)
    taxes_fees: Decimal = Field(default=Decimal("0"), ge=0)
    refundable: bool = True
    max_adults: int = Field(default=4, ge=1, le=12)


class BookingCreate(BaseModel):
    property_id: str = Field(min_length=1, max_length=64)
    rate_plan_id: str = Field(min_length=1, max_length=64)
    check_in: date
    check_out: date
    adults: int = Field(default=2, ge=1, le=12)
    children: int = Field(default=0, ge=0, le=10)
    child_ages: list[int] = Field(default_factory=list)
    rooms: int = Field(default=1, ge=1, le=8)
    extra_ids: list[str] = []
    promo_code: str | None = Field(default=None, max_length=40)
    rate_snapshot: RateSnapshot | None = None
    guest: GuestInfo


class BookingTotals(BaseModel):
    currency: str
    nights: int
    nights_subtotal: Decimal
    extras_total: Decimal
    taxes_fees: Decimal
    service_fee: Decimal
    promo_code: str | None = None
    promo_discount: Decimal
    total_amount: Decimal


class BookingCreateResult(BaseModel):
    booking_id: UUID
    reference: str
    access_token: str
    payment_timing: str
    client_secret: str
    publishable_key: str | None
    totals: BookingTotals


class BookingExtraOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    extra_id: str
    title: str
    price: Decimal


class BookingPaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str
    capture_method: str
    amount: Decimal
    amount_captured: Decimal
    amount_refunded: Decimal
    currency: str
    card_brand: str | None = None
    card_last4: str | None = None
    error_message: str | None = None
    authorized_at: datetime | None = None
    captured_at: datetime | None = None


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reference: str
    status: str
    payment_timing: str
    property_id: str
    property_name: str
    room_id: str
    room_name: str
    room_image: str | None = None
    location: str | None = None
    currency: str
    check_in: date
    check_out: date
    nights: int
    adults: int
    children: int
    child_ages: list[int]
    rooms: int
    guest_first_name: str
    guest_last_name: str | None = None
    guest_email: str
    guest_dial_code: str | None = None
    guest_phone: str | None = None
    guest_country: str | None = None
    booking_for: str
    arrival_time: str | None = None
    special_requests: str | None = None
    nights_subtotal: Decimal
    extras_total: Decimal
    taxes_fees: Decimal
    service_fee: Decimal
    promo_code: str | None = None
    promo_discount: Decimal
    total_amount: Decimal
    created_at: datetime
    confirmed_at: datetime | None = None
    cancelled_at: datetime | None = None
    extras: list[BookingExtraOut] = []
    payment: BookingPaymentOut | None = None


class AdminBookingRefundRequest(BaseModel):
    amount: Decimal | None = None
    reason: str | None = Field(default=None, max_length=255)


class BookingCancelRequest(BaseModel):
    """Guest-facing cancellation. `reason` is optional and informational."""

    reason: str | None = Field(default=None, max_length=255)


class BookingCancelOut(BaseModel):
    """Result of a guest-initiated cancellation with its refund breakdown."""

    booking: BookingOut
    status: str = "cancelled"
    refundable: bool
    refund_amount: Decimal
    refund_currency: str
    original_total: Decimal
    kept_amount: Decimal = Decimal("0")
    held_to_pay: bool = False
    cancelled_at: datetime | None = None

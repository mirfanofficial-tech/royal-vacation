from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PartnerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    business_name: str
    business_registration_number: str | None = None
    tax_id: str | None = None
    business_license_url: str | None = None
    logo_url: str | None = None
    website: str | None = None
    business_phone: str | None = None
    business_email: str | None = None
    business_address: str | None = None
    business_city: str | None = None
    business_country: str | None = None
    is_verified: bool
    verification_documents: object | None = None
    verification_notes: str | None = None
    verified_by: UUID | None = None
    verified_at: datetime | None = None
    commission_rate: float
    payment_terms: str
    auto_confirm_bookings: bool
    max_cancellation_days: int
    status: str
    created_at: datetime
    updated_at: datetime


class PartnerProfileUpdate(BaseModel):
    business_name: str | None = None
    business_registration_number: str | None = None
    tax_id: str | None = None
    business_license_url: str | None = None
    logo_url: str | None = None
    website: str | None = None
    business_phone: str | None = None
    business_email: str | None = None
    business_address: str | None = None
    business_city: str | None = None
    business_country: str | None = None
    is_verified: bool | None = None
    verification_documents: object | None = None
    verification_notes: str | None = None
    verified_by: UUID | None = None
    verified_at: datetime | None = None
    commission_rate: float | None = None
    payment_terms: str | None = None
    auto_confirm_bookings: bool | None = None
    max_cancellation_days: int | None = None
    status: str | None = None


class PartnerProfileSelfUpdate(BaseModel):
    """What a partner may edit on their own profile.

    Verification (`is_verified`, `verified_by`/`verified_at`), `status`, and
    commercial terms (`commission_rate`, `payment_terms`) are admin-controlled
    and deliberately excluded here.
    """

    business_name: str | None = None
    business_registration_number: str | None = None
    tax_id: str | None = None
    business_license_url: str | None = None
    logo_url: str | None = None
    website: str | None = None
    business_phone: str | None = None
    business_email: str | None = None
    business_address: str | None = None
    business_city: str | None = None
    business_country: str | None = None
    auto_confirm_bookings: bool | None = None
    max_cancellation_days: int | None = None


class PartnerSummaryOut(BaseModel):
    """Admin-facing row for `GET /admin/partners` — user + partner profile joined."""

    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    email: str
    first_name: str | None = None
    last_name: str | None = None
    account_status: str
    partner_profile_id: UUID | None = None
    business_name: str | None = None
    is_verified: bool | None = None
    verification_status: str | None = None
    created_at: datetime


class TravelerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    loyalty_points: int
    loyalty_tier: str
    total_bookings: int
    total_spent: float
    preferred_room_type: str | None = None
    preferred_meal_plan: str | None = None
    passport_number: str | None = None
    passport_expiry: datetime | None = None
    nationality: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    preferred_airlines: object | None = None
    preferred_hotels: object | None = None
    special_requests: str | None = None
    newsletter_subscribed: bool
    marketing_consent_given: bool
    marketing_consent_given_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class TravelerProfileUpdate(BaseModel):
    preferred_room_type: str | None = None
    preferred_meal_plan: str | None = None
    passport_number: str | None = None
    passport_expiry: datetime | None = None
    nationality: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    preferred_airlines: object | None = None
    preferred_hotels: object | None = None
    special_requests: str | None = None
    newsletter_subscribed: bool | None = None
    marketing_consent_given: bool | None = None
    marketing_consent_given_at: datetime | None = None

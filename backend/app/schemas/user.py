from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str | None = Field(default=None, min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    display_name: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    account_type: str = "traveler"
    status: str = "pending"
    preferred_currency: str = "AED"
    preferred_language: str = "en"
    timezone: str = "Asia/Dubai"
    country: str | None = None
    city: str | None = None
    address: str | None = None
    zip_code: str | None = None
    role_ids: list[UUID] = []

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str | None) -> str | None:
        if v is not None and v not in ("male", "female", "prefer_not_to_say"):
            raise ValueError("gender must be one of: male, female, prefer_not_to_say")
        return v

    @field_validator("account_type")
    @classmethod
    def validate_account_type(cls, v: str) -> str:
        if v not in ("traveler", "partner", "admin"):
            raise ValueError("account_type must be one of: traveler, partner, admin")
        return v


class UserUpdate(BaseModel):
    password: str | None = Field(default=None, min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    display_name: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    status: str | None = None
    preferred_currency: str | None = None
    preferred_language: str | None = None
    timezone: str | None = None
    country: str | None = None
    city: str | None = None
    address: str | None = None
    zip_code: str | None = None


class UserRolesUpdate(BaseModel):
    role_ids: list[UUID] = []


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    display_name: str | None = None
    phone: str | None = None
    account_type: str
    status: str
    email_verified_at: datetime | None = None
    preferred_currency: str
    preferred_language: str
    timezone: str
    country: str | None = None
    city: str | None = None
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    roles: list[str] = []

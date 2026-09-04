from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class _PromoCodeRules(BaseModel):
    """Shared rule validation for create and update payloads."""

    code: str | None = Field(default=None, min_length=1, max_length=40)
    description: str | None = None
    discount_percent: Decimal | None = Field(default=None, ge=0, le=100)
    max_discount_amount: Decimal | None = Field(default=None, ge=0)
    max_discount_currency: str | None = Field(default=None, min_length=3, max_length=3)
    min_spend_amount: Decimal | None = Field(default=None, ge=0)
    min_spend_currency: str | None = Field(default=None, min_length=3, max_length=3)
    max_uses: int | None = Field(default=None, ge=1)
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None

    @field_validator("max_discount_currency", "min_spend_currency")
    @classmethod
    def _upper_currency(cls, value: str | None) -> str | None:
        return value.upper() if value else value

    @model_validator(mode="after")
    def _require_currency_with_amount(self) -> "_PromoCodeRules":
        if (self.max_discount_amount is None) != (self.max_discount_currency is None):
            raise ValueError(
                "max_discount_currency is required whenever max_discount_amount is set, and vice versa"
            )
        if (self.min_spend_amount is None) != (self.min_spend_currency is None):
            raise ValueError(
                "min_spend_currency is required whenever min_spend_amount is set, and vice versa"
            )
        if self.expires_at and self.starts_at and self.expires_at < self.starts_at:
            raise ValueError("expires_at must be after starts_at")
        return self


class PromoCodeCreate(_PromoCodeRules):
    code: str = Field(min_length=1, max_length=40)
    discount_percent: Decimal = Field(ge=0, le=100)
    is_active: bool = True


class PromoCodeUpdate(_PromoCodeRules):
    pass


class PromoCodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    description: str | None = None
    discount_percent: Decimal
    max_discount_amount: Decimal | None = None
    max_discount_currency: str | None = None
    min_spend_amount: Decimal | None = None
    min_spend_currency: str | None = None
    max_uses: int | None = None
    used_count: int
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

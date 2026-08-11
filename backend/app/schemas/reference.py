from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CurrencyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    symbol: str
    name: str
    rate_to_aed: Decimal
    is_active: bool
    country_code: str | None = None
    is_default: bool
    created_at: datetime
    updated_at: datetime


class CurrencyCreate(BaseModel):
    code: str = Field(min_length=3, max_length=3)
    symbol: str = Field(min_length=1, max_length=10)
    name: str = Field(min_length=1, max_length=100)
    rate_to_aed: Decimal = Field(default=Decimal("1"), gt=0)
    is_active: bool = True
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    is_default: bool = False

    @field_validator("code")
    @classmethod
    def _uppercase_code(cls, v: str) -> str:
        return v.upper()


class CurrencyUpdate(BaseModel):
    symbol: str | None = Field(default=None, min_length=1, max_length=10)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    rate_to_aed: Decimal | None = Field(default=None, gt=0)
    is_active: bool | None = None
    country_code: str | None = Field(default=None, min_length=2, max_length=2)
    is_default: bool | None = None


class LanguageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    native_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class LanguageCreate(BaseModel):
    code: str = Field(min_length=2, max_length=10)
    name: str = Field(min_length=1, max_length=100)
    native_name: str = Field(min_length=1, max_length=100)
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def _lowercase_code(cls, v: str) -> str:
        return v.lower()


class LanguageUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    native_name: str | None = Field(default=None, min_length=1, max_length=100)
    is_active: bool | None = None


class CountryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    dial_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CountryCreate(BaseModel):
    code: str = Field(min_length=2, max_length=2)
    name: str = Field(min_length=1, max_length=100)
    dial_code: str = Field(min_length=1, max_length=6)
    is_active: bool = True

    @field_validator("code")
    @classmethod
    def _uppercase_code(cls, v: str) -> str:
        return v.upper()


class CountryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    dial_code: str | None = Field(default=None, min_length=1, max_length=6)
    is_active: bool | None = None

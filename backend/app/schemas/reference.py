from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CurrencyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    symbol: str
    name: str
    rate_to_aed: Decimal
    is_active: bool


class LanguageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    native_name: str
    is_active: bool


class CountryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    dial_code: str
    is_active: bool

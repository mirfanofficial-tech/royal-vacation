from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class MarkupRule(BaseModel):
    type: str
    value: Decimal


class TaxConfig(BaseModel):
    type: str
    value: Decimal


class CredentialFieldOut(BaseModel):
    key: str
    label: str
    secret: bool = False
    required: bool = False
    # Masked for secret fields, plain for the rest. `None` if unset.
    value: str | None = None


class ThirdPartyModuleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    provider: str
    module_id: str
    name: str
    category: str
    status: str
    ai_enabled: bool
    environment: str
    markup_b2b: MarkupRule
    markup_b2c: MarkupRule
    base_currency: str
    tax: TaxConfig
    credential_fields: list[CredentialFieldOut]
    help_text: str | None = None
    created_at: datetime
    updated_at: datetime


class ThirdPartyModuleUpdate(BaseModel):
    status: str | None = None
    ai_enabled: bool | None = None
    environment: str | None = None
    markup_b2b: MarkupRule | None = None
    markup_b2c: MarkupRule | None = None
    base_currency: str | None = None
    tax: TaxConfig | None = None
    # Only the provided keys are merged into the encrypted blob — an omitted
    # key keeps its existing stored value unchanged.
    credentials: dict[str, str] | None = None

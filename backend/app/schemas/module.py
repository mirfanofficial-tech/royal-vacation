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


class ApiConfig(BaseModel):
    """How to call this provider's API — see app/integrations/generic_rest.py
    for the exact shape this drives (auth type, credential key, endpoints)."""

    base_url: str
    auth_type: str  # "bearer" | "api_key" | "basic"
    auth_credential_key: str | None = None
    auth_header: str | None = None
    auth_username_key: str | None = None
    auth_password_key: str | None = None
    endpoints: dict[str, dict[str, str]] = {}


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
    api_config: ApiConfig | None = None
    field_mapping: dict[str, str] = {}
    created_at: datetime
    updated_at: datetime


class ThirdPartyModuleCreate(BaseModel):
    provider: str
    module_id: str
    name: str
    category: str
    status: str = "inactive"
    ai_enabled: bool = False
    environment: str = "development"
    markup_b2b: MarkupRule = MarkupRule(type="percentage", value=Decimal("0"))
    markup_b2c: MarkupRule = MarkupRule(type="percentage", value=Decimal("0"))
    base_currency: str = ""
    tax: TaxConfig = TaxConfig(type="percentage", value=Decimal("0"))
    credential_schema: list[dict] = []
    credentials: dict[str, str] = {}
    help_text: str | None = None
    api_config: ApiConfig | None = None
    field_mapping: dict[str, str] = {}


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
    api_config: ApiConfig | None = None
    field_mapping: dict[str, str] | None = None


class TestConnectionResult(BaseModel):
    ok: bool
    message: str
    preview: dict | None = None

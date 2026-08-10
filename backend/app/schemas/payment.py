from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PaymentGatewayCredentialsInput(BaseModel):
    """Write-only. A `None` field leaves the existing stored value unchanged
    on update — this is how "leave blank to keep the current secret" works.
    """

    public_key: str | None = None
    secret_key: str | None = None
    merchant_id: str | None = None
    webhook_secret: str | None = None


class PaymentGatewayCredentialsOut(BaseModel):
    """Read-only view. Secrets are masked and never returned in full —
    there is no endpoint that reveals a stored secret, only ones that
    replace it (see PaymentGatewayCredentialsInput).
    """

    public_key: str | None = None
    merchant_id: str | None = None
    secret_key_preview: str | None = None
    webhook_secret_preview: str | None = None


class PaymentGatewayCreate(BaseModel):
    code: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: str = "test"
    is_default: bool = False
    currencies: list[str] = []
    credentials: PaymentGatewayCredentialsInput = PaymentGatewayCredentialsInput()
    success_url: str | None = None
    cancel_url: str | None = None
    webhook_url: str | None = None


class PaymentGatewayUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: str | None = None
    currencies: list[str] | None = None
    credentials: PaymentGatewayCredentialsInput | None = None
    success_url: str | None = None
    cancel_url: str | None = None
    webhook_url: str | None = None


class PaymentGatewayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    description: str | None = None
    status: str
    is_default: bool
    currencies: list[str]
    credentials: PaymentGatewayCredentialsOut
    success_url: str | None = None
    cancel_url: str | None = None
    webhook_url: str | None = None
    created_at: datetime
    updated_at: datetime

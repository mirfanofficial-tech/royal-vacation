from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class ThirdPartyModule(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "third_party_modules"

    provider: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    module_id: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), server_default=text("'inactive'"), nullable=False
    )
    ai_enabled: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )
    environment: Mapped[str] = mapped_column(
        String(20), server_default=text("'development'"), nullable=False
    )
    markup_b2b_type: Mapped[str] = mapped_column(
        String(20), server_default=text("'percentage'"), nullable=False
    )
    markup_b2b_value: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), server_default=text("0"), nullable=False
    )
    markup_b2c_type: Mapped[str] = mapped_column(
        String(20), server_default=text("'percentage'"), nullable=False
    )
    markup_b2c_value: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), server_default=text("0"), nullable=False
    )
    base_currency: Mapped[str] = mapped_column(
        String(100), server_default=text("''"), nullable=False
    )
    tax_type: Mapped[str] = mapped_column(
        String(20), server_default=text("'percentage'"), nullable=False
    )
    tax_value: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), server_default=text("0"), nullable=False
    )
    # Plain (non-secret) field metadata for this provider's credential form —
    # key/label/secret/required. Never contains values.
    credential_schema: Mapped[list] = mapped_column(
        JSONB, server_default=text("'[]'::jsonb"), nullable=False
    )
    # Fernet-encrypted `{key: value}` blob — see app/core/crypto.py. Never
    # queried, never returned as-is; routes decrypt server-side and mask
    # secret fields before serializing a response.
    credentials_encrypted: Mapped[str | None] = mapped_column(Text)
    help_text: Mapped[str | None] = mapped_column(Text)
    # How to call this provider's API — base URL, auth type, endpoint paths
    # for search/rates/booking. Null until configured from the admin UI.
    # See VERVOTECH_INTEGRATION.md §4.
    api_config: Mapped[dict | None] = mapped_column(JSONB)
    # Canonical field -> JSONPath into this provider's response, e.g.
    # {"hotel.name": "$.propertyName"}. Walked by GenericRestSupplierClient.
    field_mapping: Mapped[dict | None] = mapped_column(JSONB)

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive')",
            name="third_party_modules_status_check",
        ),
        CheckConstraint(
            "environment IN ('development', 'staging', 'production')",
            name="third_party_modules_environment_check",
        ),
        CheckConstraint(
            "markup_b2b_type IN ('percentage', 'flat')",
            name="third_party_modules_markup_b2b_type_check",
        ),
        CheckConstraint(
            "markup_b2c_type IN ('percentage', 'flat')",
            name="third_party_modules_markup_b2c_type_check",
        ),
        CheckConstraint(
            "tax_type IN ('percentage', 'flat')",
            name="third_party_modules_tax_type_check",
        ),
    )

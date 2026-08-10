from sqlalchemy import Boolean, CheckConstraint, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class PaymentGateway(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "payment_gateways"

    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'test'"),
        nullable=False,
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    currencies: Mapped[list[str]] = mapped_column(
        JSONB,
        server_default=text("'[]'::jsonb"),
        nullable=False,
    )
    # Fernet-encrypted JSON blob — see app/core/crypto.py. Never queried,
    # never returned as-is; routes decrypt server-side and mask before
    # serializing a response.
    credentials_encrypted: Mapped[str | None] = mapped_column(Text)
    success_url: Mapped[str | None] = mapped_column(Text)
    cancel_url: Mapped[str | None] = mapped_column(Text)
    webhook_url: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'test', 'inactive')",
            name="payment_gateways_status_check",
        ),
        Index(
            "uq_payment_gateways_default",
            "is_default",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )

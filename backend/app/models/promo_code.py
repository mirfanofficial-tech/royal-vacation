from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin

_CURRENCY_LEN = String(3)


class PromoCode(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    """Promotional discount code.

    The discount is a percentage of the booking subtotal so it applies across
    any currency (AED / PKR / USD ...). Optional guard-rails keep it sane:
      - ``min_spend_*``: booking total must reach this value before the code applies.
      - ``max_discount_*``: an absolute upper bound on the discount (per currency).
      - ``max_uses``: redeemable usage cap.
    """

    __tablename__ = "promo_codes"

    code: Mapped[str] = mapped_column(
        String(40), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text)
    discount_percent: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), server_default=text("0"), nullable=False
    )
    # Optional absolute discount cap, expressed in its own currency.
    max_discount_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    max_discount_currency: Mapped[str | None] = mapped_column(_CURRENCY_LEN)
    # Optional minimum booking spend (its own currency) before the code applies.
    min_spend_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    min_spend_currency: Mapped[str | None] = mapped_column(_CURRENCY_LEN)

    max_uses: Mapped[int | None] = mapped_column(Integer)
    used_count: Mapped[int] = mapped_column(
        Integer, server_default=text("0"), nullable=False
    )
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "discount_percent >= 0 AND discount_percent <= 100",
            name="promo_codes_percent_check",
        ),
        CheckConstraint("used_count >= 0", name="promo_codes_used_count_check"),
    )

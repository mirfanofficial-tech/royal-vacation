from decimal import Decimal

from sqlalchemy import CHAR, Boolean, CheckConstraint, ForeignKey, Index, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class Currency(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "currencies"

    code: Mapped[str] = mapped_column(CHAR(3), unique=True, nullable=False)
    symbol: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rate_to_aed: Mapped[Decimal] = mapped_column(
        Numeric(14, 6),
        server_default=text("1"),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )
    country_code: Mapped[str | None] = mapped_column(
        CHAR(2), ForeignKey("countries.code", ondelete="RESTRICT")
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("rate_to_aed > 0", name="currencies_rate_check"),
        Index(
            "uq_currencies_default",
            "is_default",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )


class Language(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "languages"

    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    native_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )


class Country(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "countries"

    code: Mapped[str] = mapped_column(CHAR(2), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    dial_code: Mapped[str] = mapped_column(String(6), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )

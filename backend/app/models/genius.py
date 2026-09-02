"""Genius loyalty programme configuration.

Admin-managed tiers (``genius_levels``) and their perks
(``genius_level_benefits``) — mirrors Booking.com's Genius levels. The public
site reads the active rows to render the /genius page and to apply member
discounts; the admin panel gets full CRUD.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class GeniusLevel(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "genius_levels"

    tier: Mapped[int] = mapped_column(SmallInteger, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    stays_required: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    discount_percent: Mapped[Decimal] = mapped_column(
        Numeric(5, 2), nullable=False, server_default=text("0")
    )
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )

    benefits: Mapped[list["GeniusLevelBenefit"]] = relationship(
        back_populates="level",
        cascade="all, delete-orphan",
        order_by="GeniusLevelBenefit.sort_order",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("tier >= 1", name="genius_levels_tier_check"),
        CheckConstraint("stays_required >= 0", name="genius_levels_stays_check"),
        CheckConstraint(
            "discount_percent >= 0 AND discount_percent <= 100",
            name="genius_levels_discount_check",
        ),
    )


class GeniusLevelBenefit(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "genius_level_benefits"

    level_id: Mapped[str] = mapped_column(
        ForeignKey("genius_levels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(40))
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )

    level: Mapped["GeniusLevel"] = relationship(back_populates="benefits")

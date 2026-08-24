"""Stage B — content & mapping pipeline (VERVOTECH_INTEGRATION.md steps 12-16).

Three tables, in pipeline order:

1. `RawSupplierHotel` — a supplier's hotel export landed as-is (step 12).
   Nothing normalized yet; `payload` is whatever that supplier's API returned.
2. `Hotel` — the canonical, deduplicated hotel record, keyed by
   `vervotech_id` (step 14/15). Scoped to genuinely *curated content* only —
   name, location, star rating, amenities, images/description. Deliberately
   does NOT carry `rating`/`reviews`/`price`: those are live/computed
   (guest reviews, Stage C's rates layer), not something Vervotech's
   Curated Content module provides, and don't belong hardcoded here.
3. `SupplierHotelLink` — one row per (hotel, supplier) match resolved by
   Vervotech's Hotel Mapping (step 13); this is what Stage C's rate-merging
   fans out over.

Steps 12/13/15 (the actual supplier export pull + Vervotech Mapping/Curated
Content calls) are NOT implemented yet — no supplier identities or
credentials exist to call for real (see VERVOTECH_INTEGRATION.md §7). This
module is schema-only, ready for that data once it does.
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class RawSupplierHotel(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "raw_supplier_hotels"

    supplier: Mapped[str] = mapped_column(String(100), nullable=False)
    supplier_hotel_id: Mapped[str] = mapped_column(String(255), nullable=False)
    # The supplier's response as received, unnormalized.
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    __table_args__ = (
        UniqueConstraint("supplier", "supplier_hotel_id", name="uq_raw_supplier_hotels_supplier_hotel"),
        Index("idx_raw_supplier_hotels_supplier", "supplier"),
    )


class Hotel(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "hotels"

    # Business key from Vervotech's Hotel Mapping — nullable until step 15
    # populates it; a hotel can exist here (from mapping) before its curated
    # content has been pulled.
    vervotech_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    star_rating: Mapped[int | None] = mapped_column(Integer)
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(255))
    country: Mapped[str | None] = mapped_column(String(255))
    lat: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    lng: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    amenities: Mapped[list] = mapped_column(JSONB, server_default=text("'[]'::jsonb"), nullable=False)
    hero_image: Mapped[str | None] = mapped_column(Text)
    gallery_images: Mapped[list] = mapped_column(
        JSONB, server_default=text("'[]'::jsonb"), nullable=False
    )
    # When Curated Content was last pulled (step 28, Stage E) — null until
    # step 15 actually runs for this hotel.
    content_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    supplier_links: Mapped[list["SupplierHotelLink"]] = relationship(
        back_populates="hotel",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SupplierHotelLink(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "supplier_hotel_links"

    hotel_id: Mapped[str] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    supplier: Mapped[str] = mapped_column(String(100), nullable=False)
    supplier_hotel_id: Mapped[str] = mapped_column(String(255), nullable=False)

    hotel: Mapped[Hotel] = relationship(back_populates="supplier_links")

    __table_args__ = (
        UniqueConstraint(
            "supplier", "supplier_hotel_id", name="uq_supplier_hotel_links_supplier_hotel"
        ),
        Index("idx_supplier_hotel_links_hotel_id", "hotel_id"),
    )

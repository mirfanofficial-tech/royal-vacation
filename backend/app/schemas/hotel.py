from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SupplierHotelLinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    supplier: str
    supplier_hotel_id: str


class HotelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    vervotech_id: str
    name: str
    description: str | None = None
    star_rating: int | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    lat: Decimal | None = None
    lng: Decimal | None = None
    amenities: list[str] = []
    hero_image: str | None = None
    gallery_images: list[str] = []
    content_synced_at: datetime | None = None
    supplier_links: list[SupplierHotelLinkOut] = []
    created_at: datetime
    updated_at: datetime


class HotelPipelineStatsOut(BaseModel):
    """Snapshot of Stage B's pipeline — see VERVOTECH_INTEGRATION.md. All
    zero until steps 12/13/15 (real supplier/Vervotech pulls) run for real."""

    mapped_hotels: int
    raw_supplier_records: int
    raw_records_by_supplier: dict[str, int]
    supplier_links: int

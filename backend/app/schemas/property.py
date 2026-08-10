from pydantic import BaseModel, Field


class PropertyBase(BaseModel):
    name: str
    city: str
    country: str
    property_type: str
    price_per_night: float = Field(gt=0)
    currency: str = "AED"
    description: str | None = None
    address: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    image_url: str | None = None
    amenities: list[str] = []


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    name: str | None = None
    city: str | None = None
    country: str | None = None
    property_type: str | None = None
    price_per_night: float | None = Field(default=None, gt=0)
    currency: str | None = None
    description: str | None = None
    address: str | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    image_url: str | None = None
    amenities: list[str] | None = None


class Property(PropertyBase):
    id: str

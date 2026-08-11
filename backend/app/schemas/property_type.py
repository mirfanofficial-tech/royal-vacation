from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PropertyTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str | None = None
    count_label: str | None = None
    image_url: str | None = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PropertyTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(min_length=1, max_length=100)
    description: str | None = None
    count_label: str | None = None
    sort_order: int = 0
    is_active: bool = True


class PropertyTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None
    count_label: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---- Benefits ---------------------------------------------------------------


class GeniusBenefitBase(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    icon: str | None = Field(default=None, max_length=40)
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class GeniusBenefitCreate(GeniusBenefitBase):
    """A benefit sent inside a level create/update payload. `id` present = keep/update
    an existing row; absent = new row. Any existing benefit not listed is removed."""

    id: UUID | None = None


class GeniusBenefitUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    icon: str | None = Field(default=None, max_length=40)
    sort_order: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class GeniusBenefitOut(GeniusBenefitBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    level_id: UUID
    created_at: datetime
    updated_at: datetime


# ---- Levels ---------------------------------------------------------------


class GeniusLevelBase(BaseModel):
    tier: int = Field(ge=1, le=20)
    name: str = Field(min_length=1, max_length=60)
    slug: str | None = Field(default=None, max_length=40)
    stays_required: int = Field(default=0, ge=0)
    discount_percent: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    description: str | None = Field(default=None, max_length=4000)
    is_active: bool = True


class GeniusLevelCreate(GeniusLevelBase):
    benefits: list[GeniusBenefitCreate] = Field(default_factory=list)

    @field_validator("slug")
    @classmethod
    def _slugify(cls, v: str | None) -> str | None:
        return v.strip().lower().replace(" ", "-") if v else v


class GeniusLevelUpdate(BaseModel):
    tier: int | None = Field(default=None, ge=1, le=20)
    name: str | None = Field(default=None, min_length=1, max_length=60)
    slug: str | None = Field(default=None, max_length=40)
    stays_required: int | None = Field(default=None, ge=0)
    discount_percent: Decimal | None = Field(default=None, ge=0, le=100)
    description: str | None = Field(default=None, max_length=4000)
    is_active: bool | None = None
    # When provided, fully replaces the level's benefit list.
    benefits: list[GeniusBenefitCreate] | None = None

    @field_validator("slug")
    @classmethod
    def _slugify(cls, v: str | None) -> str | None:
        return v.strip().lower().replace(" ", "-") if v else v


class GeniusLevelOut(GeniusLevelBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    benefits: list[GeniusBenefitOut] = []
    created_at: datetime
    updated_at: datetime


# ---- Public (unauthenticated) --------------------------------------------


class GeniusBenefitPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    label: str
    description: str | None = None
    icon: str | None = None


class GeniusLevelPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    tier: int
    name: str
    stays_required: int
    discount_percent: Decimal
    description: str | None = None
    benefits: list[GeniusBenefitPublicOut] = []

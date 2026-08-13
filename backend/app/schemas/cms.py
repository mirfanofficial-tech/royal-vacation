from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CmsPageTranslationValue(BaseModel):
    title: str = ""
    excerpt: str = ""
    content: str = ""
    meta_title: str = ""
    meta_description: str = ""


class CmsPageSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    excerpt: str | None = None
    featured_image_url: str | None = None
    parent_id: UUID | None = None
    parent_title: str | None = None
    sort_order: int
    status: str
    is_homepage: bool
    author_name: str
    view_count: int
    published_at: datetime | None = None
    page_type: str
    route_path: str | None = None
    translation_language_codes: list[str] = []
    created_at: datetime
    updated_at: datetime


class CmsPageOut(CmsPageSummaryOut):
    content: str
    meta_title: str | None = None
    meta_description: str | None = None
    translations: dict[str, CmsPageTranslationValue] = {}


class CmsPageCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    excerpt: str | None = None
    content: str = ""
    featured_image_url: str | None = None
    parent_id: UUID | None = None
    sort_order: int = 0
    status: str = "draft"
    is_homepage: bool = False
    meta_title: str | None = None
    meta_description: str | None = None
    author_name: str = "Royal Vacation Admin"
    published_at: datetime | None = None
    page_type: str = "content"
    route_path: str | None = None
    translations: dict[str, CmsPageTranslationValue] = {}


class CmsPageUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    excerpt: str | None = None
    content: str | None = None
    parent_id: UUID | None = None
    sort_order: int | None = None
    status: str | None = None
    is_homepage: bool | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    author_name: str | None = None
    published_at: datetime | None = None
    page_type: str | None = None
    route_path: str | None = None
    translations: dict[str, CmsPageTranslationValue] | None = None


class CmsBlockOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    content: str
    block_type: str
    location: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CmsBlockCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    slug: str = Field(min_length=1, max_length=150)
    content: str = ""
    block_type: str = "text"
    location: str | None = None
    is_active: bool = True


class CmsBlockUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    slug: str | None = Field(default=None, min_length=1, max_length=150)
    content: str | None = None
    block_type: str | None = None
    location: str | None = None
    is_active: bool | None = None


class CmsMenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    menu_id: UUID
    page_id: UUID | None = None
    page_slug: str | None = None
    label: str
    url: str | None = None
    sort_order: int
    is_active: bool


class CmsMenuItemCreate(BaseModel):
    label: str = Field(min_length=1, max_length=150)
    page_id: UUID | None = None
    url: str | None = None
    sort_order: int = 0
    is_active: bool = True


class CmsMenuItemUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=150)
    page_id: UUID | None = None
    url: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class CmsMenuOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    location: str | None = None
    is_active: bool
    items: list[CmsMenuItemOut] = []
    created_at: datetime
    updated_at: datetime


class CmsMenuCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    slug: str = Field(min_length=1, max_length=150)
    location: str | None = None
    is_active: bool = True


class CmsMenuUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    slug: str | None = Field(default=None, min_length=1, max_length=150)
    location: str | None = None
    is_active: bool | None = None

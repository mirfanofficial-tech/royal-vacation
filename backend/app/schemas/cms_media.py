from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MediaFolderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sort_order: int
    asset_count: int = 0
    created_at: datetime
    updated_at: datetime


class MediaFolderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sort_order: int = 0


class MediaFolderUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    sort_order: int | None = None


class MediaAssetTranslationValue(BaseModel):
    alt_text: str = ""


class MediaAssetSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    filename: str
    file_url: str
    asset_type: str
    folder_id: UUID | None = None
    width: int | None = None
    height: int | None = None
    size_bytes: int
    format: str
    alt_text: str
    tags: list[str] = []
    uploaded_by: str
    used_in_count: int = 0
    translation_language_codes: list[str] = []
    created_at: datetime
    updated_at: datetime


class MediaAssetOut(MediaAssetSummaryOut):
    translations: dict[str, MediaAssetTranslationValue] = {}


class MediaAssetUpdate(BaseModel):
    folder_id: UUID | None = None
    alt_text: str | None = None
    tags: list[str] | None = None
    translations: dict[str, MediaAssetTranslationValue] | None = None

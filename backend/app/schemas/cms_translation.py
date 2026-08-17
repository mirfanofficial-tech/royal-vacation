from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


TranslationTaskEntityType = Literal["cms_page", "blog_post"]
TranslationTaskStatus = Literal["requested", "done", "cancelled"]


class TranslationTaskCreate(BaseModel):
    entity_type: TranslationTaskEntityType
    entity_id: UUID
    target_language_code: str = Field(min_length=2, max_length=10)


class TranslationTaskUpdate(BaseModel):
    status: TranslationTaskStatus


class TranslationTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    entity_type: str
    entity_id: UUID
    entity_title: str | None = None
    target_language_code: str
    status: str
    requested_by: str
    created_at: datetime
    updated_at: datetime

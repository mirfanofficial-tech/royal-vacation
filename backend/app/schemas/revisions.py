from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RevisionSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    entity_type: str
    entity_id: UUID
    title: str
    created_by: str
    created_at: datetime


class RevisionOut(RevisionSummaryOut):
    snapshot: dict

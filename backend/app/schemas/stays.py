from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StaySettingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    setting_type: str
    name: str
    is_active: bool
    translations: dict[str, str]
    created_at: datetime
    updated_at: datetime


class StaySettingCreate(BaseModel):
    setting_type: str
    name: str
    is_active: bool = True
    translations: dict[str, str] = {}


class StaySettingUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    translations: dict[str, str] | None = None

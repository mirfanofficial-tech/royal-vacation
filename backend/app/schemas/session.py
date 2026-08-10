from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    device_type: str
    device_name: str | None = None
    browser: str | None = None
    os: str | None = None
    ip_address: object | None = None
    location: str | None = None
    is_active: bool
    last_activity_at: datetime
    expires_at: datetime
    created_at: datetime


class UserActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None = None
    session_id: UUID | None = None
    action: str
    resource_type: str | None = None
    resource_id: UUID | None = None
    details: object | None = None
    ip_address: object | None = None
    created_at: datetime

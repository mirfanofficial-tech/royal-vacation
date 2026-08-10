from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RoleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    display_name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    level: int = Field(default=0, ge=0)
    is_system: bool = False
    status: str = "active"


class RoleUpdate(BaseModel):
    display_name: str | None = None
    description: str | None = None
    level: int | None = Field(default=None, ge=0)
    status: str | None = None


class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    display_name: str
    description: str | None = None
    level: int
    is_system: bool
    status: str
    created_at: datetime
    updated_at: datetime


class PermissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    resource: str
    action: str
    description: str | None = None


class RolePermissionInput(BaseModel):
    module: str
    action: str


class RolePermissionsUpdate(BaseModel):
    permissions: list[RolePermissionInput] = []

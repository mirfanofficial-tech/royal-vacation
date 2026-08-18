from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ContactTopic = Literal[
    "booking", "refund", "invoice", "stay_issue", "group", "press", "other"
]
ContactChannel = Literal["email", "phone", "whatsapp"]
ContactMessageStatus = Literal["new", "in_progress", "resolved"]


class ContactMessageCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    booking_reference: str | None = Field(default=None, max_length=50)
    topic: ContactTopic
    preferred_channel: ContactChannel = "email"
    message: str = Field(min_length=1, max_length=1500)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str
    phone: str | None = None
    booking_reference: str | None = None
    topic: str
    preferred_channel: str
    message: str
    status: str
    created_at: datetime


class ContactMessageStatusUpdate(BaseModel):
    status: ContactMessageStatus

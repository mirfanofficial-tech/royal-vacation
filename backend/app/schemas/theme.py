from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SiteThemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    header_variant: str
    footer_variant: str
    heading_font_size: str
    paragraph_font_size: str
    font_family: str
    logo_url: str | None = None
    created_at: datetime
    updated_at: datetime


class SiteThemeUpdate(BaseModel):
    header_variant: str | None = None
    footer_variant: str | None = None
    heading_font_size: str | None = None
    paragraph_font_size: str | None = None
    font_family: str | None = None

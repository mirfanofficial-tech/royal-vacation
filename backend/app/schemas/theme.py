import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

_HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}$")
_CORNER_STYLES = {"sharp", "soft", "round"}


class SiteThemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    header_variant: str
    footer_variant: str
    heading_font_size: str
    paragraph_font_size: str
    font_family: str
    logo_url: str | None = None
    admin_sidebar_color: str | None = None
    admin_sidebar_text_color: str | None = None
    admin_primary_color: str | None = None
    admin_accent_color: str | None = None
    admin_corner_style: str | None = None
    created_at: datetime
    updated_at: datetime


class SiteThemeUpdate(BaseModel):
    header_variant: str | None = None
    footer_variant: str | None = None
    heading_font_size: str | None = None
    paragraph_font_size: str | None = None
    font_family: str | None = None
    admin_sidebar_color: str | None = None
    admin_sidebar_text_color: str | None = None
    admin_primary_color: str | None = None
    admin_accent_color: str | None = None
    admin_corner_style: str | None = None

    @field_validator(
        "admin_sidebar_color",
        "admin_sidebar_text_color",
        "admin_primary_color",
        "admin_accent_color",
    )
    @classmethod
    def _valid_hex_color(cls, value: str | None) -> str | None:
        if value is not None and not _HEX_COLOR.match(value):
            raise ValueError("must be a #RRGGBB hex colour")
        return value

    @field_validator("admin_corner_style")
    @classmethod
    def _valid_corner_style(cls, value: str | None) -> str | None:
        if value is not None and value not in _CORNER_STYLES:
            raise ValueError(f"must be one of {sorted(_CORNER_STYLES)}")
        return value

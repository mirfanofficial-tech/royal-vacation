from sqlalchemy import CheckConstraint, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class SiteTheme(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "site_theme"

    header_variant: Mapped[str] = mapped_column(
        String(20), server_default=text("'default'"), nullable=False
    )
    footer_variant: Mapped[str] = mapped_column(
        String(20), server_default=text("'classic'"), nullable=False
    )
    heading_font_size: Mapped[str] = mapped_column(
        String(10), server_default=text("'md'"), nullable=False
    )
    paragraph_font_size: Mapped[str] = mapped_column(
        String(10), server_default=text("'md'"), nullable=False
    )
    font_family: Mapped[str] = mapped_column(
        String(30), server_default=text("'outfit'"), nullable=False
    )
    logo_url: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint(
            "header_variant IN ('default', 'classic', 'variant_2', 'variant_3', 'variant_4', 'variant_5')",
            name="site_theme_header_variant_check",
        ),
        CheckConstraint(
            "footer_variant IN ('classic', 'variant_2', 'variant_3', 'variant_4', 'variant_5')",
            name="site_theme_footer_variant_check",
        ),
        CheckConstraint(
            "heading_font_size IN ('sm', 'md', 'lg', 'xl')",
            name="site_theme_heading_font_size_check",
        ),
        CheckConstraint(
            "paragraph_font_size IN ('sm', 'md', 'lg', 'xl')",
            name="site_theme_paragraph_font_size_check",
        ),
        CheckConstraint(
            "font_family IN ('outfit', 'inter', 'poppins', 'playfair_display', 'roboto')",
            name="site_theme_font_family_check",
        ),
    )

from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Text,
    Uuid,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class CmsPage(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_pages"

    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    featured_image_url: Mapped[str | None] = mapped_column(Text)
    parent_id: Mapped[str | None] = mapped_column(
        ForeignKey("cms_pages.id", ondelete="SET NULL")
    )
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)
    status: Mapped[str] = mapped_column(Text, server_default=text("'draft'"), nullable=False)
    is_homepage: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )
    meta_title: Mapped[str | None] = mapped_column(Text)
    meta_description: Mapped[str | None] = mapped_column(Text)
    author_name: Mapped[str] = mapped_column(
        Text, server_default=text("'Royal Vacation Admin'"), nullable=False
    )
    view_count: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    page_type: Mapped[str] = mapped_column(Text, server_default=text("'content'"), nullable=False)
    route_path: Mapped[str | None] = mapped_column(Text)

    translations: Mapped[list["CmsPageTranslation"]] = relationship(
        back_populates="cms_page",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class CmsPageTranslation(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_page_translations"

    cms_page_id: Mapped[str] = mapped_column(
        ForeignKey("cms_pages.id", ondelete="CASCADE"), nullable=False
    )
    language_code: Mapped[str] = mapped_column(
        ForeignKey("languages.code", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    content: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    meta_title: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    meta_description: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)

    cms_page: Mapped[CmsPage] = relationship(back_populates="translations")


class CmsBlock(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_blocks"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    block_type: Mapped[str] = mapped_column(Text, server_default=text("'text'"), nullable=False)
    location: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )


class CmsMenu(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_menus"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    location: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )

    items: Mapped[list["CmsMenuItem"]] = relationship(
        back_populates="menu",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="CmsMenuItem.sort_order",
    )


class CmsMenuItem(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_menu_items"

    menu_id: Mapped[str] = mapped_column(
        ForeignKey("cms_menus.id", ondelete="CASCADE"), nullable=False
    )
    page_id: Mapped[str | None] = mapped_column(
        ForeignKey("cms_pages.id", ondelete="SET NULL")
    )
    label: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )

    menu: Mapped[CmsMenu] = relationship(back_populates="items")
    page: Mapped[CmsPage | None] = relationship(lazy="selectin")

    @property
    def page_slug(self) -> str | None:
        return self.page.slug if self.page else None


class CmsMediaFolder(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_media_folders"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)


class CmsMediaAsset(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_media_assets"

    filename: Mapped[str] = mapped_column(Text, nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    asset_type: Mapped[str] = mapped_column(Text, nullable=False)
    folder_id: Mapped[str | None] = mapped_column(
        ForeignKey("cms_media_folders.id", ondelete="SET NULL")
    )
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    format: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(Text), server_default=text("'{}'"), nullable=False
    )
    uploaded_by: Mapped[str] = mapped_column(
        Text, server_default=text("'Royal Vacation Admin'"), nullable=False
    )

    translations: Mapped[list["CmsMediaAssetTranslation"]] = relationship(
        back_populates="media_asset",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class CmsMediaAssetTranslation(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "cms_media_asset_translations"

    media_asset_id: Mapped[str] = mapped_column(
        ForeignKey("cms_media_assets.id", ondelete="CASCADE"), nullable=False
    )
    language_code: Mapped[str] = mapped_column(
        ForeignKey("languages.code", ondelete="CASCADE"), nullable=False
    )
    alt_text: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)

    media_asset: Mapped[CmsMediaAsset] = relationship(back_populates="translations")


class CmsContentRevision(UUIDPrimaryKeyMixin, CreatedAtMixin, Base):
    __tablename__ = "cms_content_revisions"

    entity_type: Mapped[str] = mapped_column(Text, nullable=False)
    entity_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    snapshot: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_by: Mapped[str] = mapped_column(
        Text, server_default=text("'Royal Vacation Admin'"), nullable=False
    )


class CmsTranslationTask(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    """Lightweight "translate entity X into language Y" flag (Phase 3).

    No assignee/reviewer/quality-score columns — this is a flag-as-needed
    tracker, not an assignment workflow. Polymorphic `entity_type` +
    `entity_id` (no FK) mirrors `cms_content_revisions`, spanning cms_pages
    and blog_posts. A partial unique index keeps at most one *active*
    (requested) task per entity+language.
    """

    __tablename__ = "cms_translation_tasks"

    entity_type: Mapped[str] = mapped_column(Text, nullable=False)
    entity_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    target_language_code: Mapped[str] = mapped_column(
        ForeignKey("languages.code", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        Text, server_default=text("'requested'"), nullable=False
    )
    requested_by: Mapped[str] = mapped_column(
        Text, server_default=text("'Royal Vacation Admin'"), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "entity_type IN ('cms_page','blog_post')",
            name="cms_translation_tasks_entity_type_check",
        ),
        CheckConstraint(
            "status IN ('requested','done','cancelled')",
            name="cms_translation_tasks_status_check",
        ),
        Index(
            "uq_cms_translation_tasks_active",
            "entity_type",
            "entity_id",
            "target_language_code",
            unique=True,
            postgresql_where=text("status = 'requested'"),
        ),
        Index("idx_cms_translation_tasks_entity", "entity_type", "entity_id"),
        Index("idx_cms_translation_tasks_status", "status"),
    )

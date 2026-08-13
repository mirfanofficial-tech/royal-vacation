from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class BlogCategory(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "blog_categories"

    name: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    color: Mapped[str] = mapped_column(Text, server_default=text("'navy'"), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, server_default=text("true"), nullable=False)


class BlogPost(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "blog_posts"

    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    category_id: Mapped[str | None] = mapped_column(
        ForeignKey("blog_categories.id", ondelete="SET NULL")
    )
    excerpt: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    cover_image_url: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(Text), server_default=text("'{}'"), nullable=False
    )
    status: Mapped[str] = mapped_column(Text, server_default=text("'draft'"), nullable=False)
    author_name: Mapped[str] = mapped_column(
        Text, server_default=text("'Royal Vacation Admin'"), nullable=False
    )
    meta_title: Mapped[str | None] = mapped_column(Text)
    meta_description: Mapped[str | None] = mapped_column(Text)
    focus_keyword: Mapped[str | None] = mapped_column(Text)
    views: Mapped[int] = mapped_column(Integer, server_default=text("0"), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    translations: Mapped[list["BlogPostTranslation"]] = relationship(
        back_populates="blog_post",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class BlogPostTranslation(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "blog_post_translations"

    blog_post_id: Mapped[str] = mapped_column(
        ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False
    )
    language_code: Mapped[str] = mapped_column(
        ForeignKey("languages.code", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)
    content: Mapped[str] = mapped_column(Text, server_default=text("''"), nullable=False)

    blog_post: Mapped[BlogPost] = relationship(back_populates="translations")


class BlogComment(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "blog_comments"

    blog_post_id: Mapped[str] = mapped_column(
        ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False
    )
    parent_comment_id: Mapped[str | None] = mapped_column(
        ForeignKey("blog_comments.id", ondelete="CASCADE")
    )
    author_name: Mapped[str] = mapped_column(Text, nullable=False)
    author_email: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, server_default=text("'pending'"), nullable=False)
    is_admin_reply: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )

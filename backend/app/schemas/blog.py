from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class BlogCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    slug: str
    description: str | None = None
    color: str
    sort_order: int = 0
    is_visible: bool = True
    post_count: int = 0
    created_at: datetime
    updated_at: datetime


class BlogCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    slug: str = Field(min_length=1, max_length=150)
    description: str | None = None
    color: str = "navy"
    sort_order: int = 0
    is_visible: bool = True


class BlogCategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    slug: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    color: str | None = None
    sort_order: int | None = None
    is_visible: bool | None = None


class BlogPostTranslationValue(BaseModel):
    title: str = ""
    content: str = ""


class BlogPostSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    slug: str
    category_id: UUID | None = None
    category_name: str | None = None
    category_slug: str | None = None
    excerpt: str | None = None
    cover_image_url: str | None = None
    tags: list[str]
    status: str
    author_name: str
    views: int
    comment_count: int = 0
    reading_minutes: int = 1
    published_at: datetime | None = None
    translation_language_codes: list[str] = []
    created_at: datetime
    updated_at: datetime


class BlogPostCountOut(BaseModel):
    total: int


class BlogPostOut(BlogPostSummaryOut):
    content: str
    meta_title: str | None = None
    meta_description: str | None = None
    focus_keyword: str | None = None
    translations: dict[str, BlogPostTranslationValue] = {}


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    category_id: UUID | None = None
    excerpt: str | None = None
    content: str = ""
    tags: list[str] = []
    status: str = "draft"
    author_name: str = "Royal Vacation Admin"
    meta_title: str | None = None
    meta_description: str | None = None
    focus_keyword: str | None = None
    published_at: datetime | None = None
    translations: dict[str, BlogPostTranslationValue] = {}


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    category_id: UUID | None = None
    excerpt: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    status: str | None = None
    author_name: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    focus_keyword: str | None = None
    published_at: datetime | None = None
    translations: dict[str, BlogPostTranslationValue] | None = None


class BlogCommentPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_comment_id: UUID | None = None
    author_name: str
    body: str
    is_admin_reply: bool
    status: str
    created_at: datetime


class BlogCommentAdminOut(BlogCommentPublicOut):
    blog_post_id: UUID
    post_title: str
    post_slug: str
    author_email: str
    updated_at: datetime


class BlogCommentCreate(BaseModel):
    author_name: str = Field(min_length=1, max_length=150)
    author_email: EmailStr
    body: str = Field(min_length=1, max_length=5000)
    parent_comment_id: UUID | None = None


class BlogCommentModerate(BaseModel):
    status: Literal["approved", "rejected"]


class BlogCommentReplyCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)

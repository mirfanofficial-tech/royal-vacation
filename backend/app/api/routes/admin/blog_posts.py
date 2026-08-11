"""Admin Blog Posts — `/api/v1/admin/blog/posts/*`.

Translations are a normalized child table (`blog_post_translations`, keyed by
the real `languages.code`) using the exact delete-then-reinsert full-replace
pattern from `admin/stays.py`. `comment_count`/`category_name` are computed
via joins/subqueries on every read, never stored. Cover image upload mirrors
`admin/property_types.py::upload_property_type_image` exactly.

IMPORTANT: after any write, re-fetch via a fresh `select()` — never
`db.refresh(obj, attribute_names=["translations"])` on this lazy="selectin"
relationship in an async context, it raises `MissingGreenlet` (this exact
bug was hit and fixed on `StaySetting` earlier this session).
"""

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.blog import BlogCategory, BlogComment, BlogPost, BlogPostTranslation
from app.schemas.blog import (
    BlogPostCreate,
    BlogPostOut,
    BlogPostSummaryOut,
    BlogPostTranslationValue,
    BlogPostUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])

ALLOWED_IMAGE_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/svg+xml"}
MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MB
UPLOAD_DIR = Path("static") / "uploads"


def _comment_count_subquery():
    return (
        select(BlogComment.blog_post_id, func.count(BlogComment.id).label("comment_count"))
        .group_by(BlogComment.blog_post_id)
        .subquery()
    )


def _to_summary_out(
    post: BlogPost, category_name: str | None, category_slug: str | None, comment_count: int
) -> BlogPostSummaryOut:
    return BlogPostSummaryOut(
        id=post.id,
        title=post.title,
        slug=post.slug,
        category_id=post.category_id,
        category_name=category_name,
        category_slug=category_slug,
        excerpt=post.excerpt,
        cover_image_url=post.cover_image_url,
        tags=post.tags,
        status=post.status,
        author_name=post.author_name,
        views=post.views,
        comment_count=comment_count,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def _to_out(
    post: BlogPost, category_name: str | None, category_slug: str | None, comment_count: int
) -> BlogPostOut:
    summary = _to_summary_out(post, category_name, category_slug, comment_count)
    return BlogPostOut(
        **summary.model_dump(),
        content=post.content,
        meta_title=post.meta_title,
        meta_description=post.meta_description,
        translations={
            t.language_code: BlogPostTranslationValue(title=t.title, content=t.content)
            for t in post.translations
        },
    )


async def _get_post(db: AsyncSession, post_id: str) -> BlogPost:
    try:
        uid = UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    result = await db.execute(select(BlogPost).where(BlogPost.id == uid))
    post = result.scalar_one_or_none()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return post


async def _get_post_row(db: AsyncSession, post_id: str) -> BlogPostOut:
    try:
        uid = UUID(post_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    comment_count_subq = _comment_count_subquery()
    result = await db.execute(
        select(
            BlogPost,
            BlogCategory.name,
            BlogCategory.slug,
            func.coalesce(comment_count_subq.c.comment_count, 0),
        )
        .outerjoin(BlogCategory, BlogCategory.id == BlogPost.category_id)
        .outerjoin(comment_count_subq, comment_count_subq.c.blog_post_id == BlogPost.id)
        .where(BlogPost.id == uid)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    post, category_name, category_slug, comment_count = row
    return _to_out(post, category_name, category_slug, comment_count)


async def _replace_translations(
    db: AsyncSession, post_id: UUID, translations: dict[str, BlogPostTranslationValue]
) -> None:
    await db.execute(delete(BlogPostTranslation).where(BlogPostTranslation.blog_post_id == post_id))
    for language_code, value in translations.items():
        if not value.title.strip() and not value.content.strip():
            continue
        db.add(
            BlogPostTranslation(
                blog_post_id=post_id,
                language_code=language_code,
                title=value.title,
                content=value.content,
            )
        )


@router.get("", response_model=list[BlogPostSummaryOut])
async def list_blog_posts(
    category_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[BlogPostSummaryOut]:
    comment_count_subq = _comment_count_subquery()
    query = (
        select(
            BlogPost,
            BlogCategory.name,
            BlogCategory.slug,
            func.coalesce(comment_count_subq.c.comment_count, 0),
        )
        .outerjoin(BlogCategory, BlogCategory.id == BlogPost.category_id)
        .outerjoin(comment_count_subq, comment_count_subq.c.blog_post_id == BlogPost.id)
        .order_by(BlogPost.created_at.desc())
    )
    if category_id:
        query = query.where(BlogPost.category_id == category_id)
    if status_filter:
        query = query.where(BlogPost.status == status_filter)
    if q:
        query = query.where(BlogPost.title.ilike(f"%{q}%"))
    result = await db.execute(query)
    return [
        _to_summary_out(post, category_name, category_slug, count)
        for post, category_name, category_slug, count in result.all()
    ]


@router.post("", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
async def create_blog_post(payload: BlogPostCreate, db: AsyncSession = Depends(get_db)) -> BlogPostOut:
    existing = await db.execute(select(BlogPost).where(BlogPost.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    data = payload.model_dump(exclude={"translations"})
    post = BlogPost(**data)
    db.add(post)
    await db.flush()

    await _replace_translations(db, post.id, payload.translations)

    await db.commit()
    return await _get_post_row(db, str(post.id))


@router.get("/{post_id}", response_model=BlogPostOut)
async def get_blog_post(post_id: str, db: AsyncSession = Depends(get_db)) -> BlogPostOut:
    return await _get_post_row(db, post_id)


@router.patch("/{post_id}", response_model=BlogPostOut)
async def update_blog_post(
    post_id: str, payload: BlogPostUpdate, db: AsyncSession = Depends(get_db)
) -> BlogPostOut:
    post = await _get_post(db, post_id)

    if payload.slug is not None and payload.slug != post.slug:
        existing = await db.execute(
            select(BlogPost).where(BlogPost.slug == payload.slug, BlogPost.id != post.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    data = payload.model_dump(exclude_unset=True, exclude={"translations"})
    for field, value in data.items():
        setattr(post, field, value)

    if payload.translations is not None:
        await _replace_translations(db, post.id, payload.translations)
        # `post.translations` was eager-loaded (lazy="selectin") by `_get_post`
        # above; the bulk delete/insert in `_replace_translations` bypasses the
        # ORM identity map, so without this the stale in-session collection
        # would be returned below instead of the rows we just wrote.
        db.expire(post, ["translations"])

    await db.commit()
    return await _get_post_row(db, post_id)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(post_id: str, db: AsyncSession = Depends(get_db)) -> None:
    post = await _get_post(db, post_id)
    await db.delete(post)
    await db.commit()


@router.post("/{post_id}/cover-image", response_model=BlogPostOut)
async def upload_blog_post_cover_image(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
) -> BlogPostOut:
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be a PNG, JPEG, WEBP or SVG image.",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 2 MB.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "").suffix
    filename = f"{uuid4()}{suffix}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    post = await _get_post(db, post_id)
    post.cover_image_url = f"/static/uploads/{filename}"
    await db.commit()
    return await _get_post_row(db, post_id)

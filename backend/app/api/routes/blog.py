"""Public Blog — `/api/v1/blog/*`, unauthenticated.

Backs the client site's `/blog` listing + detail pages and the homepage's
"Featured Blogs" widget. Only `status='published'` posts whose
`published_at` has passed (or is unset) are ever visible here; "scheduled"
posts do not auto-flip to published (no cron/worker exists in this
codebase — cosmetic status only). Comments are only ever shown here once
`status='approved'` by an admin. Mutations live under
`app/api/routes/admin/blog_posts.py`/`blog_categories.py`/`blog_comments.py`.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.blog import BlogCategory, BlogComment, BlogPost
from app.schemas.blog import (
    BlogCategoryOut,
    BlogCommentCreate,
    BlogCommentPublicOut,
    BlogPostOut,
    BlogPostSummaryOut,
    BlogPostTranslationValue,
)

router = APIRouter()


def _published_filters(query):
    return query.where(BlogPost.status == "published").where(
        or_(BlogPost.published_at.is_(None), BlogPost.published_at <= func.now())
    )


def _comment_count_subquery():
    return (
        select(BlogComment.blog_post_id, func.count(BlogComment.id).label("comment_count"))
        .where(BlogComment.status == "approved")
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


@router.get("/categories", response_model=list[BlogCategoryOut])
async def list_public_blog_categories(db: AsyncSession = Depends(get_db)) -> list[BlogCategoryOut]:
    count_subq = (
        select(BlogPost.category_id, func.count(BlogPost.id).label("post_count"))
        .where(BlogPost.status == "published")
        .group_by(BlogPost.category_id)
        .subquery()
    )
    result = await db.execute(
        select(BlogCategory, func.coalesce(count_subq.c.post_count, 0))
        .outerjoin(count_subq, count_subq.c.category_id == BlogCategory.id)
        .order_by(BlogCategory.name)
    )
    return [
        BlogCategoryOut(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            color=category.color,
            post_count=count,
            created_at=category.created_at,
            updated_at=category.updated_at,
        )
        for category, count in result.all()
    ]


@router.get("/posts", response_model=list[BlogPostSummaryOut])
async def list_public_blog_posts(
    category: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=12, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
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
    )
    query = _published_filters(query)
    if category:
        query = query.where(BlogCategory.slug == category)
    if q:
        query = query.where(BlogPost.title.ilike(f"%{q}%"))
    query = (
        query.order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())
        .limit(limit + 1)
        .offset(offset)
    )
    result = await db.execute(query)
    return [
        _to_summary_out(post, name, slug, count) for post, name, slug, count in result.all()
    ]


@router.get("/posts/{slug}", response_model=BlogPostOut)
async def get_public_blog_post(slug: str, db: AsyncSession = Depends(get_db)) -> BlogPostOut:
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
        .where(BlogPost.slug == slug)
    )
    query = _published_filters(query)
    result = await db.execute(query)
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    post, category_name, category_slug, comment_count = row

    # Build the response while `post.translations` is still loaded from the
    # select above — `db.commit()` expires every attribute on every object in
    # the session by default (`expire_on_commit=True`), and re-accessing a
    # lazy="selectin" relationship afterwards raises MissingGreenlet (the
    # same bug class already hit and fixed on StaySetting this session).
    out = _to_out(post, category_name, category_slug, comment_count)
    out.views = out.views + 1

    post.views = post.views + 1
    await db.commit()

    return out


@router.get("/posts/{slug}/comments", response_model=list[BlogCommentPublicOut])
async def list_public_blog_comments(
    slug: str, db: AsyncSession = Depends(get_db)
) -> list[BlogCommentPublicOut]:
    post_result = await db.execute(select(BlogPost.id).where(BlogPost.slug == slug))
    post_id = post_result.scalar_one_or_none()
    if post_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    result = await db.execute(
        select(BlogComment)
        .where(BlogComment.blog_post_id == post_id, BlogComment.status == "approved")
        .order_by(BlogComment.created_at)
    )
    return [BlogCommentPublicOut.model_validate(c) for c in result.scalars().all()]


@router.post(
    "/posts/{slug}/comments",
    response_model=BlogCommentPublicOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_public_blog_comment(
    slug: str, payload: BlogCommentCreate, db: AsyncSession = Depends(get_db)
) -> BlogCommentPublicOut:
    post_result = await db.execute(
        select(BlogPost.id).where(BlogPost.slug == slug, BlogPost.status == "published")
    )
    post_id = post_result.scalar_one_or_none()
    if post_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")

    comment = BlogComment(
        blog_post_id=post_id,
        parent_comment_id=payload.parent_comment_id,
        author_name=payload.author_name,
        author_email=payload.author_email,
        body=payload.body,
        status="pending",
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return BlogCommentPublicOut.model_validate(comment)

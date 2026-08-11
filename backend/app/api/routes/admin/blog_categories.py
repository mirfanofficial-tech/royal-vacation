"""Admin Blog Categories — `/api/v1/admin/blog/categories/*`.

Same flat CRUD shape as `property_types.py`. `post_count` is computed via a
grouped subquery over `blog_posts`, never stored, so it can't drift.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.blog import BlogCategory, BlogPost
from app.schemas.blog import BlogCategoryCreate, BlogCategoryOut, BlogCategoryUpdate

router = APIRouter(dependencies=[Depends(require_admin)])


def _to_out(category: BlogCategory, post_count: int) -> BlogCategoryOut:
    return BlogCategoryOut(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        color=category.color,
        post_count=post_count,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )


async def _get_category(db: AsyncSession, category_id: str) -> BlogCategory:
    try:
        uid = UUID(category_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog category not found")
    result = await db.execute(select(BlogCategory).where(BlogCategory.id == uid))
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog category not found")
    return category


async def _post_count(db: AsyncSession, category_id: UUID) -> int:
    result = await db.execute(
        select(func.count(BlogPost.id)).where(BlogPost.category_id == category_id)
    )
    return result.scalar_one()


@router.get("", response_model=list[BlogCategoryOut])
async def list_blog_categories(db: AsyncSession = Depends(get_db)) -> list[BlogCategoryOut]:
    count_subq = (
        select(BlogPost.category_id, func.count(BlogPost.id).label("post_count"))
        .group_by(BlogPost.category_id)
        .subquery()
    )
    result = await db.execute(
        select(BlogCategory, func.coalesce(count_subq.c.post_count, 0))
        .outerjoin(count_subq, count_subq.c.category_id == BlogCategory.id)
        .order_by(BlogCategory.name)
    )
    return [_to_out(category, count) for category, count in result.all()]


@router.post("", response_model=BlogCategoryOut, status_code=status.HTTP_201_CREATED)
async def create_blog_category(
    payload: BlogCategoryCreate, db: AsyncSession = Depends(get_db)
) -> BlogCategoryOut:
    existing = await db.execute(select(BlogCategory).where(BlogCategory.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    category = BlogCategory(**payload.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return _to_out(category, 0)


@router.get("/{category_id}", response_model=BlogCategoryOut)
async def get_blog_category(category_id: str, db: AsyncSession = Depends(get_db)) -> BlogCategoryOut:
    category = await _get_category(db, category_id)
    count = await _post_count(db, category.id)
    return _to_out(category, count)


@router.patch("/{category_id}", response_model=BlogCategoryOut)
async def update_blog_category(
    category_id: str, payload: BlogCategoryUpdate, db: AsyncSession = Depends(get_db)
) -> BlogCategoryOut:
    category = await _get_category(db, category_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    count = await _post_count(db, category.id)
    return _to_out(category, count)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_category(category_id: str, db: AsyncSession = Depends(get_db)) -> None:
    category = await _get_category(db, category_id)
    await db.delete(category)
    await db.commit()

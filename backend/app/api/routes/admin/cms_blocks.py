"""Admin CMS Blocks — `/api/v1/admin/cms/blocks/*`.

Reusable named content snippets. Flat CRUD, same shape as
`admin/blog_categories.py`/`admin/property_types.py`.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.cms import CmsBlock
from app.schemas.cms import CmsBlockCreate, CmsBlockOut, CmsBlockUpdate

router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_block(db: AsyncSession, block_id: str) -> CmsBlock:
    try:
        uid = UUID(block_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Block not found")
    result = await db.execute(select(CmsBlock).where(CmsBlock.id == uid))
    block = result.scalar_one_or_none()
    if block is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Block not found")
    return block


@router.get("", response_model=list[CmsBlockOut])
async def list_cms_blocks(
    location: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[CmsBlockOut]:
    query = select(CmsBlock).order_by(CmsBlock.name)
    if location:
        query = query.where(CmsBlock.location == location)
    result = await db.execute(query)
    return [CmsBlockOut.model_validate(b) for b in result.scalars().all()]


@router.post("", response_model=CmsBlockOut, status_code=status.HTTP_201_CREATED)
async def create_cms_block(payload: CmsBlockCreate, db: AsyncSession = Depends(get_db)) -> CmsBlockOut:
    existing = await db.execute(select(CmsBlock).where(CmsBlock.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    block = CmsBlock(**payload.model_dump())
    db.add(block)
    await db.commit()
    await db.refresh(block)
    return CmsBlockOut.model_validate(block)


@router.get("/{block_id}", response_model=CmsBlockOut)
async def get_cms_block(block_id: str, db: AsyncSession = Depends(get_db)) -> CmsBlockOut:
    block = await _get_block(db, block_id)
    return CmsBlockOut.model_validate(block)


@router.patch("/{block_id}", response_model=CmsBlockOut)
async def update_cms_block(
    block_id: str, payload: CmsBlockUpdate, db: AsyncSession = Depends(get_db)
) -> CmsBlockOut:
    block = await _get_block(db, block_id)

    if payload.slug is not None and payload.slug != block.slug:
        existing = await db.execute(
            select(CmsBlock).where(CmsBlock.slug == payload.slug, CmsBlock.id != block.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(block, field, value)
    await db.commit()
    await db.refresh(block)
    return CmsBlockOut.model_validate(block)


@router.delete("/{block_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cms_block(block_id: str, db: AsyncSession = Depends(get_db)) -> None:
    block = await _get_block(db, block_id)
    await db.delete(block)
    await db.commit()

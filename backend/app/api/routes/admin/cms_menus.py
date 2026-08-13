"""Admin CMS Menus — `/api/v1/admin/cms/menus/*` (+ nested items).

Flat, reorderable menus/items — no drag-and-drop, `sort_order` + the
existing admin UI's up/down-arrow buttons (matching the Property Types
precedent). `CmsMenu.items` and `CmsMenuItem.page` are both
`lazy="selectin"`, so a plain `select(CmsMenu)` already returns everything
`CmsMenuOut` needs — no extra joins, unlike `blog_posts.py`'s category join.
Every mutation re-fetches the whole menu via a fresh `select()` afterwards
rather than touching the already-loaded `items` relationship post-commit —
the same `MissingGreenlet`-avoidance pattern used across the CMS/Blog
routes this session.

IMPORTANT: the session factory uses `expire_on_commit=False` (avoids
MissingGreenlet on attribute access after commit elsewhere), which means a
`CmsMenu` object stays in the identity map across the whole request with
whatever `.items` it loaded on first fetch — a bare re-`select()` after
mutating an item does NOT pick up the change, since SQLAlchemy just returns
the same cached object with its stale `.items` collection. `_get_menu`
passes `execution_options(populate_existing=True)` to force every fetch to
overwrite the identity-mapped object's relationships (including the nested
`page` lazy="selectin" load) from the fresh query results.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.cms import CmsMenu, CmsMenuItem
from app.schemas.cms import (
    CmsMenuCreate,
    CmsMenuItemCreate,
    CmsMenuItemUpdate,
    CmsMenuOut,
    CmsMenuUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_menu(db: AsyncSession, menu_id: str) -> CmsMenu:
    try:
        uid = UUID(menu_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")
    result = await db.execute(
        select(CmsMenu)
        .where(CmsMenu.id == uid)
        .execution_options(populate_existing=True)
    )
    menu = result.scalar_one_or_none()
    if menu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")
    return menu


async def _get_menu_row(db: AsyncSession, menu_id: str) -> CmsMenuOut:
    menu = await _get_menu(db, menu_id)
    return CmsMenuOut.model_validate(menu)


async def _get_item(db: AsyncSession, menu_id: str, item_id: str) -> CmsMenuItem:
    try:
        menu_uid = UUID(menu_id)
        item_uid = UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    result = await db.execute(
        select(CmsMenuItem).where(CmsMenuItem.id == item_uid, CmsMenuItem.menu_id == menu_uid)
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
    return item


@router.get("", response_model=list[CmsMenuOut])
async def list_cms_menus(db: AsyncSession = Depends(get_db)) -> list[CmsMenuOut]:
    result = await db.execute(select(CmsMenu).order_by(CmsMenu.name))
    return [CmsMenuOut.model_validate(m) for m in result.scalars().all()]


@router.post("", response_model=CmsMenuOut, status_code=status.HTTP_201_CREATED)
async def create_cms_menu(payload: CmsMenuCreate, db: AsyncSession = Depends(get_db)) -> CmsMenuOut:
    existing = await db.execute(select(CmsMenu).where(CmsMenu.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    menu = CmsMenu(**payload.model_dump())
    db.add(menu)
    await db.commit()
    return await _get_menu_row(db, str(menu.id))


@router.get("/{menu_id}", response_model=CmsMenuOut)
async def get_cms_menu(menu_id: str, db: AsyncSession = Depends(get_db)) -> CmsMenuOut:
    return await _get_menu_row(db, menu_id)


@router.patch("/{menu_id}", response_model=CmsMenuOut)
async def update_cms_menu(
    menu_id: str, payload: CmsMenuUpdate, db: AsyncSession = Depends(get_db)
) -> CmsMenuOut:
    menu = await _get_menu(db, menu_id)
    if payload.slug is not None and payload.slug != menu.slug:
        existing = await db.execute(
            select(CmsMenu).where(CmsMenu.slug == payload.slug, CmsMenu.id != menu.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(menu, field, value)
    await db.commit()
    return await _get_menu_row(db, menu_id)


@router.delete("/{menu_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cms_menu(menu_id: str, db: AsyncSession = Depends(get_db)) -> None:
    menu = await _get_menu(db, menu_id)
    await db.delete(menu)
    await db.commit()


@router.post("/{menu_id}/items", response_model=CmsMenuOut, status_code=status.HTTP_201_CREATED)
async def create_cms_menu_item(
    menu_id: str, payload: CmsMenuItemCreate, db: AsyncSession = Depends(get_db)
) -> CmsMenuOut:
    menu = await _get_menu(db, menu_id)
    item = CmsMenuItem(menu_id=menu.id, **payload.model_dump())
    db.add(item)
    await db.commit()
    return await _get_menu_row(db, menu_id)


@router.patch("/{menu_id}/items/{item_id}", response_model=CmsMenuOut)
async def update_cms_menu_item(
    menu_id: str, item_id: str, payload: CmsMenuItemUpdate, db: AsyncSession = Depends(get_db)
) -> CmsMenuOut:
    item = await _get_item(db, menu_id, item_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.commit()
    return await _get_menu_row(db, menu_id)


@router.delete("/{menu_id}/items/{item_id}", response_model=CmsMenuOut)
async def delete_cms_menu_item(
    menu_id: str, item_id: str, db: AsyncSession = Depends(get_db)
) -> CmsMenuOut:
    item = await _get_item(db, menu_id, item_id)
    await db.delete(item)
    await db.commit()
    return await _get_menu_row(db, menu_id)

"""Public CMS — `/api/v1/cms/*`, unauthenticated.

Backs the client site's `/pages/{slug}` renderer and, in future, dynamic
menu/block rendering in the shared Header/Footer (not wired in this pass —
see the CMS module plan). Only `status='published'` pages are ever visible
here. Mutations live under `app/api/routes/admin/cms_pages.py` /
`cms_blocks.py` / `cms_menus.py` (admin-gated).
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.db.session import get_db
from app.models.cms import CmsBlock, CmsMenu, CmsPage
from app.schemas.cms import (
    CmsBlockOut,
    CmsMenuOut,
    CmsPageOut,
    CmsPageSummaryOut,
    CmsPageTranslationValue,
)

router = APIRouter()

ParentPage = aliased(CmsPage)


def _to_summary_out(page: CmsPage, parent_title: str | None) -> CmsPageSummaryOut:
    return CmsPageSummaryOut(
        id=page.id,
        title=page.title,
        slug=page.slug,
        excerpt=page.excerpt,
        featured_image_url=page.featured_image_url,
        parent_id=page.parent_id,
        parent_title=parent_title,
        sort_order=page.sort_order,
        status=page.status,
        is_homepage=page.is_homepage,
        author_name=page.author_name,
        view_count=page.view_count,
        published_at=page.published_at,
        page_type=page.page_type,
        route_path=page.route_path,
        created_at=page.created_at,
        updated_at=page.updated_at,
    )


def _to_out(page: CmsPage, parent_title: str | None) -> CmsPageOut:
    summary = _to_summary_out(page, parent_title)
    return CmsPageOut(
        **summary.model_dump(),
        content=page.content,
        meta_title=page.meta_title,
        meta_description=page.meta_description,
        translations={
            t.language_code: CmsPageTranslationValue(
                title=t.title,
                excerpt=t.excerpt,
                content=t.content,
                meta_title=t.meta_title,
                meta_description=t.meta_description,
            )
            for t in page.translations
        },
    )


@router.get("/pages", response_model=list[CmsPageSummaryOut])
async def list_public_cms_pages(db: AsyncSession = Depends(get_db)) -> list[CmsPageSummaryOut]:
    result = await db.execute(
        select(CmsPage, ParentPage.title)
        .outerjoin(ParentPage, ParentPage.id == CmsPage.parent_id)
        .where(CmsPage.status == "published")
        .order_by(CmsPage.sort_order, CmsPage.title)
    )
    return [_to_summary_out(page, parent_title) for page, parent_title in result.all()]


@router.get("/pages/by-route", response_model=CmsPageOut)
async def get_public_cms_page_by_route(
    path: str = Query(...), db: AsyncSession = Depends(get_db)
) -> CmsPageOut:
    result = await db.execute(
        select(CmsPage, ParentPage.title)
        .outerjoin(ParentPage, ParentPage.id == CmsPage.parent_id)
        .where(
            CmsPage.route_path == path,
            CmsPage.page_type == "system",
            CmsPage.status == "published",
        )
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page, parent_title = row
    return _to_out(page, parent_title)


@router.get("/pages/{slug}", response_model=CmsPageOut)
async def get_public_cms_page(slug: str, db: AsyncSession = Depends(get_db)) -> CmsPageOut:
    result = await db.execute(
        select(CmsPage, ParentPage.title)
        .outerjoin(ParentPage, ParentPage.id == CmsPage.parent_id)
        .where(CmsPage.slug == slug, CmsPage.status == "published", CmsPage.page_type == "content")
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page, parent_title = row

    # Build the response while everything needed is still loaded — db.commit()
    # expires every attribute on every object in the session by default, and
    # re-accessing anything on `page` afterwards risks the same MissingGreenlet
    # bug already hit twice this session (StaySetting translations, the blog
    # post view-count increment). Increment on the already-built out object,
    # then commit the underlying row separately.
    out = _to_out(page, parent_title)
    out.view_count = out.view_count + 1

    page.view_count = page.view_count + 1
    await db.commit()

    return out


@router.get("/blocks", response_model=list[CmsBlockOut])
async def list_public_cms_blocks(
    location: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[CmsBlockOut]:
    query = select(CmsBlock).where(CmsBlock.is_active.is_(True)).order_by(CmsBlock.name)
    if location:
        query = query.where(CmsBlock.location == location)
    result = await db.execute(query)
    return [CmsBlockOut.model_validate(b) for b in result.scalars().all()]


@router.get("/menus/{location}", response_model=CmsMenuOut)
async def get_public_cms_menu(location: str, db: AsyncSession = Depends(get_db)) -> CmsMenuOut:
    result = await db.execute(
        select(CmsMenu).where(CmsMenu.location == location, CmsMenu.is_active.is_(True))
    )
    menu = result.scalars().first()
    if menu is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu not found")
    out = CmsMenuOut.model_validate(menu)
    out.items = [item for item in out.items if item.is_active]
    return out

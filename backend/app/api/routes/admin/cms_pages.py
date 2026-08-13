"""Admin CMS Pages — `/api/v1/admin/cms/pages/*`.

Mirrors `admin/blog_posts.py`'s shape: a summary/full output split (page
bodies can be heavy), a self-joined `parent_title` for display, and the
byte-for-byte `theme.py`/`property_types.py` image-upload pattern for the
featured image. Setting `is_homepage=true` on one page unsets it on every
other page (single-homepage invariant), matching the "set default" pattern
already used for Currency's `is_default` flag elsewhere in this codebase.

IMPORTANT: after any write, re-fetch via a fresh `select()` — never touch an
already-loaded relationship after `db.commit()` (which expires it by
default) without re-fetching first. This is the exact `MissingGreenlet` bug
class hit twice already this session (StaySetting translations, and the
public blog post view-count increment).
"""

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.cms import CmsPage, CmsPageTranslation
from app.models.user import User
from app.schemas.cms import (
    CmsPageCreate,
    CmsPageOut,
    CmsPageSummaryOut,
    CmsPageTranslationValue,
    CmsPageUpdate,
)
from app.schemas.revisions import RevisionOut, RevisionSummaryOut
from app.services import revisions as revision_service

router = APIRouter(dependencies=[Depends(require_admin)])

ALLOWED_IMAGE_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/svg+xml"}
MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MB
UPLOAD_DIR = Path("static") / "uploads"

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
        translation_language_codes=sorted(t.language_code for t in page.translations),
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


async def _get_page(db: AsyncSession, page_id: str) -> CmsPage:
    try:
        uid = UUID(page_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    result = await db.execute(select(CmsPage).where(CmsPage.id == uid))
    page = result.scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


async def _get_page_row(db: AsyncSession, page_id: str) -> CmsPageOut:
    try:
        uid = UUID(page_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    result = await db.execute(
        select(CmsPage, ParentPage.title)
        .outerjoin(ParentPage, ParentPage.id == CmsPage.parent_id)
        .where(CmsPage.id == uid)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page, parent_title = row
    return _to_out(page, parent_title)


async def _unset_other_homepages(db: AsyncSession, keep_id: UUID) -> None:
    result = await db.execute(
        select(CmsPage).where(CmsPage.is_homepage.is_(True), CmsPage.id != keep_id)
    )
    for other in result.scalars().all():
        other.is_homepage = False


async def _replace_translations(
    db: AsyncSession, page_id: UUID, translations: dict[str, CmsPageTranslationValue]
) -> None:
    await db.execute(delete(CmsPageTranslation).where(CmsPageTranslation.cms_page_id == page_id))
    for language_code, value in translations.items():
        if not any(
            v.strip() for v in (value.title, value.excerpt, value.content, value.meta_title, value.meta_description)
        ):
            continue
        db.add(
            CmsPageTranslation(
                cms_page_id=page_id,
                language_code=language_code,
                title=value.title,
                excerpt=value.excerpt,
                content=value.content,
                meta_title=value.meta_title,
                meta_description=value.meta_description,
            )
        )


def _snapshot_of(page: CmsPage) -> dict:
    return {
        "title": page.title,
        "slug": page.slug,
        "excerpt": page.excerpt,
        "content": page.content,
        "meta_title": page.meta_title,
        "meta_description": page.meta_description,
        "translations": {
            t.language_code: {
                "title": t.title,
                "excerpt": t.excerpt,
                "content": t.content,
                "meta_title": t.meta_title,
                "meta_description": t.meta_description,
            }
            for t in page.translations
        },
    }


async def _check_route_path_unique(
    db: AsyncSession, route_path: str, exclude_id: UUID | None = None
) -> None:
    query = select(CmsPage).where(CmsPage.route_path == route_path)
    if exclude_id is not None:
        query = query.where(CmsPage.id != exclude_id)
    existing = await db.execute(query)
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Route path already in use")


@router.get("", response_model=list[CmsPageSummaryOut])
async def list_cms_pages(
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[CmsPageSummaryOut]:
    query = (
        select(CmsPage, ParentPage.title)
        .outerjoin(ParentPage, ParentPage.id == CmsPage.parent_id)
        .order_by(CmsPage.sort_order, CmsPage.title)
    )
    if status_filter:
        query = query.where(CmsPage.status == status_filter)
    if q:
        query = query.where(CmsPage.title.ilike(f"%{q}%"))
    result = await db.execute(query)
    return [_to_summary_out(page, parent_title) for page, parent_title in result.all()]


@router.post("", response_model=CmsPageOut, status_code=status.HTTP_201_CREATED)
async def create_cms_page(payload: CmsPageCreate, db: AsyncSession = Depends(get_db)) -> CmsPageOut:
    existing = await db.execute(select(CmsPage).where(CmsPage.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    if payload.page_type == "system":
        if not payload.route_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System pages require a route_path",
            )
        if payload.parent_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System pages cannot have a parent page",
            )
        await _check_route_path_unique(db, payload.route_path)

    data = payload.model_dump(exclude={"translations"})
    if payload.page_type != "system":
        data["route_path"] = None
    page = CmsPage(**data)
    db.add(page)
    await db.flush()

    await _replace_translations(db, page.id, payload.translations)

    if page.is_homepage:
        await _unset_other_homepages(db, page.id)

    await db.commit()
    return await _get_page_row(db, str(page.id))


@router.get("/{page_id}", response_model=CmsPageOut)
async def get_cms_page(page_id: str, db: AsyncSession = Depends(get_db)) -> CmsPageOut:
    return await _get_page_row(db, page_id)


@router.patch("/{page_id}", response_model=CmsPageOut)
async def update_cms_page(
    page_id: str,
    payload: CmsPageUpdate,
    create_revision: bool = Query(default=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> CmsPageOut:
    page = await _get_page(db, page_id)
    pre_update_snapshot = _snapshot_of(page)

    if payload.slug is not None and payload.slug != page.slug:
        existing = await db.execute(
            select(CmsPage).where(CmsPage.slug == payload.slug, CmsPage.id != page.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    if payload.parent_id is not None and payload.parent_id == page.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="A page cannot be its own parent"
        )

    resulting_page_type = payload.page_type if payload.page_type is not None else page.page_type
    resulting_route_path = (
        payload.route_path if payload.route_path is not None else page.route_path
    )
    resulting_parent_id = payload.parent_id if payload.parent_id is not None else page.parent_id

    if resulting_page_type == "system":
        if not resulting_route_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System pages require a route_path",
            )
        if resulting_parent_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="System pages cannot have a parent page",
            )
        if resulting_route_path != page.route_path:
            await _check_route_path_unique(db, resulting_route_path, exclude_id=page.id)

    data = payload.model_dump(exclude_unset=True, exclude={"translations"})
    for field, value in data.items():
        setattr(page, field, value)

    if resulting_page_type != "system":
        page.route_path = None

    if payload.translations is not None:
        await _replace_translations(db, page.id, payload.translations)
        db.expire(page, ["translations"])

    if payload.is_homepage:
        await _unset_other_homepages(db, page.id)

    if create_revision:
        await revision_service.create_revision(
            db, "cms_page", page.id, pre_update_snapshot, current_user.display_name or current_user.email
        )

    await db.commit()
    return await _get_page_row(db, page_id)


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cms_page(page_id: str, db: AsyncSession = Depends(get_db)) -> None:
    page = await _get_page(db, page_id)
    if page.page_type == "system":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="System pages cannot be deleted"
        )
    await db.delete(page)
    await db.commit()


@router.post("/{page_id}/featured-image", response_model=CmsPageOut)
async def upload_cms_page_featured_image(
    page_id: str,
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
) -> CmsPageOut:
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

    page = await _get_page(db, page_id)
    page.featured_image_url = f"/static/uploads/{filename}"
    await db.commit()
    return await _get_page_row(db, page_id)


@router.get("/{page_id}/revisions", response_model=list[RevisionSummaryOut])
async def list_cms_page_revisions(
    page_id: str, db: AsyncSession = Depends(get_db)
) -> list[RevisionSummaryOut]:
    page = await _get_page(db, page_id)
    return await revision_service.list_revisions(db, "cms_page", page.id)


@router.get("/{page_id}/revisions/{revision_id}", response_model=RevisionOut)
async def get_cms_page_revision(
    page_id: str, revision_id: str, db: AsyncSession = Depends(get_db)
) -> RevisionOut:
    page = await _get_page(db, page_id)
    try:
        rid = UUID(revision_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    revision = await revision_service.get_revision(db, "cms_page", page.id, rid)
    if revision is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    return revision_service.to_revision_out(revision)


@router.post("/{page_id}/revisions/{revision_id}/restore", response_model=CmsPageOut)
async def restore_cms_page_revision(
    page_id: str,
    revision_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> CmsPageOut:
    page = await _get_page(db, page_id)
    try:
        rid = UUID(revision_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    revision = await revision_service.get_revision(db, "cms_page", page.id, rid)
    if revision is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")

    display_name = current_user.display_name or current_user.email
    await revision_service.create_revision(
        db, "cms_page", page.id, _snapshot_of(page), f"{display_name} (pre-restore)"
    )

    snapshot = revision.snapshot
    page.title = snapshot["title"]
    page.slug = snapshot["slug"]
    page.excerpt = snapshot["excerpt"]
    page.content = snapshot["content"]
    page.meta_title = snapshot["meta_title"]
    page.meta_description = snapshot["meta_description"]

    translation_values = {
        code: CmsPageTranslationValue(**value) for code, value in snapshot["translations"].items()
    }
    await _replace_translations(db, page.id, translation_values)
    db.expire(page, ["translations"])

    await db.commit()
    return await _get_page_row(db, page_id)

"""Admin CMS Media Library — `/api/v1/admin/cms/media/*`.

Backs the Media Library admin screen, which was built earlier this session
against local mock data. Mirrors `cms_pages.py`'s shapes: a summary/full
output split, the same local-disk `static/uploads` upload convention used
by `cms_pages.py`/`blog_posts.py`/`property_types.py`/`theme.py` (just
generalized beyond images to documents/video/vector), and the same
translation-table pattern as `cms_page_translations` for per-language alt
text.

`used_in_count` is intentionally not stored — it's computed on every read by
scanning cms_pages/blog_posts/cms_blocks content for the asset's file_url, so
it always reflects reality instead of drifting out of sync.

IMPORTANT: after any write, re-fetch via a fresh `select()` — see the same
warning in `cms_pages.py`'s module docstring for why.
"""

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.blog import BlogPost
from app.models.cms import CmsBlock, CmsMediaAsset, CmsMediaAssetTranslation, CmsMediaFolder, CmsPage
from app.schemas.cms_media import (
    MediaAssetOut,
    MediaAssetSummaryOut,
    MediaAssetTranslationValue,
    MediaAssetUpdate,
    MediaFolderCreate,
    MediaFolderOut,
    MediaFolderUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])

UPLOAD_DIR = Path("static") / "uploads"

CONTENT_TYPE_MAP: dict[str, tuple[str, str]] = {
    "image/png": ("image", "PNG"),
    "image/jpeg": ("image", "JPEG"),
    "image/webp": ("image", "WEBP"),
    "image/svg+xml": ("vector", "SVG"),
    "application/pdf": ("document", "PDF"),
    "video/mp4": ("video", "MP4"),
    "video/webm": ("video", "WEBM"),
}
MAX_BYTES_BY_TYPE: dict[str, int] = {
    "image": 5 * 1024 * 1024,
    "vector": 2 * 1024 * 1024,
    "document": 10 * 1024 * 1024,
    "video": 50 * 1024 * 1024,
}


# ---------------------------------------------------------------------------
# Folders
# ---------------------------------------------------------------------------


@router.get("/folders", response_model=list[MediaFolderOut])
async def list_media_folders(db: AsyncSession = Depends(get_db)) -> list[MediaFolderOut]:
    result = await db.execute(
        select(CmsMediaFolder, func.count(CmsMediaAsset.id))
        .outerjoin(CmsMediaAsset, CmsMediaAsset.folder_id == CmsMediaFolder.id)
        .group_by(CmsMediaFolder.id)
        .order_by(CmsMediaFolder.sort_order, CmsMediaFolder.name)
    )
    folders: list[MediaFolderOut] = []
    for folder, asset_count in result.all():
        out = MediaFolderOut.model_validate(folder)
        out.asset_count = asset_count
        folders.append(out)
    return folders


async def _get_folder(db: AsyncSession, folder_id: str) -> CmsMediaFolder:
    try:
        uid = UUID(folder_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    result = await db.execute(select(CmsMediaFolder).where(CmsMediaFolder.id == uid))
    folder = result.scalar_one_or_none()
    if folder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    return folder


@router.post("/folders", response_model=MediaFolderOut, status_code=status.HTTP_201_CREATED)
async def create_media_folder(
    payload: MediaFolderCreate, db: AsyncSession = Depends(get_db)
) -> MediaFolderOut:
    folder = CmsMediaFolder(**payload.model_dump())
    db.add(folder)
    await db.commit()
    out = MediaFolderOut.model_validate(folder)
    out.asset_count = 0
    return out


@router.patch("/folders/{folder_id}", response_model=MediaFolderOut)
async def update_media_folder(
    folder_id: str, payload: MediaFolderUpdate, db: AsyncSession = Depends(get_db)
) -> MediaFolderOut:
    folder = await _get_folder(db, folder_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(folder, field, value)
    await db.commit()
    result = await db.execute(select(func.count(CmsMediaAsset.id)).where(CmsMediaAsset.folder_id == folder.id))
    out = MediaFolderOut.model_validate(folder)
    out.asset_count = result.scalar_one()
    return out


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_folder(folder_id: str, db: AsyncSession = Depends(get_db)) -> None:
    folder = await _get_folder(db, folder_id)
    await db.delete(folder)
    await db.commit()


# ---------------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------------


async def _used_in_counts(db: AsyncSession, file_urls: list[str]) -> dict[str, int]:
    if not file_urls:
        return {}
    page_rows = (await db.execute(select(CmsPage.content, CmsPage.featured_image_url))).all()
    post_rows = (await db.execute(select(BlogPost.content, BlogPost.cover_image_url))).all()
    block_rows = (await db.execute(select(CmsBlock.content))).all()

    haystacks: list[str] = []
    for content, featured_image_url in page_rows:
        haystacks.append(content or "")
        haystacks.append(featured_image_url or "")
    for content, cover_image_url in post_rows:
        haystacks.append(content or "")
        haystacks.append(cover_image_url or "")
    for (content,) in block_rows:
        haystacks.append(content or "")

    return {url: sum(1 for h in haystacks if url in h) for url in file_urls}


def _to_summary_out(asset: CmsMediaAsset, used_in_count: int) -> MediaAssetSummaryOut:
    return MediaAssetSummaryOut(
        id=asset.id,
        filename=asset.filename,
        file_url=asset.file_url,
        asset_type=asset.asset_type,
        folder_id=asset.folder_id,
        width=asset.width,
        height=asset.height,
        size_bytes=asset.size_bytes,
        format=asset.format,
        alt_text=asset.alt_text,
        tags=asset.tags,
        uploaded_by=asset.uploaded_by,
        used_in_count=used_in_count,
        translation_language_codes=sorted(t.language_code for t in asset.translations),
        created_at=asset.created_at,
        updated_at=asset.updated_at,
    )


def _to_out(asset: CmsMediaAsset, used_in_count: int) -> MediaAssetOut:
    summary = _to_summary_out(asset, used_in_count)
    return MediaAssetOut(
        **summary.model_dump(),
        translations={
            t.language_code: MediaAssetTranslationValue(alt_text=t.alt_text)
            for t in asset.translations
        },
    )


async def _get_asset(db: AsyncSession, asset_id: str) -> CmsMediaAsset:
    try:
        uid = UUID(asset_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    result = await db.execute(select(CmsMediaAsset).where(CmsMediaAsset.id == uid))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset


async def _get_asset_out(db: AsyncSession, asset_id: str) -> MediaAssetOut:
    asset = await _get_asset(db, asset_id)
    counts = await _used_in_counts(db, [asset.file_url])
    return _to_out(asset, counts.get(asset.file_url, 0))


async def _replace_translations(
    db: AsyncSession, asset_id: UUID, translations: dict[str, MediaAssetTranslationValue]
) -> None:
    await db.execute(
        delete(CmsMediaAssetTranslation).where(CmsMediaAssetTranslation.media_asset_id == asset_id)
    )
    for language_code, value in translations.items():
        if not value.alt_text.strip():
            continue
        db.add(
            CmsMediaAssetTranslation(
                media_asset_id=asset_id,
                language_code=language_code,
                alt_text=value.alt_text,
            )
        )


@router.get("/assets", response_model=list[MediaAssetSummaryOut])
async def list_media_assets(
    folder_id: str | None = Query(default=None),
    asset_type: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[MediaAssetSummaryOut]:
    query = select(CmsMediaAsset).order_by(CmsMediaAsset.created_at.desc())
    if folder_id:
        try:
            query = query.where(CmsMediaAsset.folder_id == UUID(folder_id))
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid folder_id")
    if asset_type:
        query = query.where(CmsMediaAsset.asset_type == asset_type)
    if q:
        query = query.where(CmsMediaAsset.filename.ilike(f"%{q}%"))

    result = await db.execute(query)
    assets = result.scalars().all()
    counts = await _used_in_counts(db, [a.file_url for a in assets])
    return [_to_summary_out(asset, counts.get(asset.file_url, 0)) for asset in assets]


@router.get("/assets/{asset_id}", response_model=MediaAssetOut)
async def get_media_asset(asset_id: str, db: AsyncSession = Depends(get_db)) -> MediaAssetOut:
    return await _get_asset_out(db, asset_id)


@router.post("/assets", response_model=MediaAssetOut, status_code=status.HTTP_201_CREATED)
async def upload_media_asset(
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
    folder_id: str | None = Form(default=None),
) -> MediaAssetOut:
    mapped = CONTENT_TYPE_MAP.get(file.content_type or "")
    if mapped is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed: PNG, JPEG, WEBP, SVG, PDF, MP4, WEBM.",
        )
    asset_type, format_label = mapped

    contents = await file.read()
    max_bytes = MAX_BYTES_BY_TYPE[asset_type]
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File must be smaller than {max_bytes // (1024 * 1024)} MB.",
        )

    parsed_folder_id: UUID | None = None
    if folder_id:
        try:
            parsed_folder_id = UUID(folder_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid folder_id")
        await _get_folder(db, str(parsed_folder_id))

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    original_name = file.filename or "upload"
    suffix = Path(original_name).suffix
    stored_filename = f"{uuid4()}{suffix}"
    (UPLOAD_DIR / stored_filename).write_bytes(contents)

    asset = CmsMediaAsset(
        filename=original_name,
        file_url=f"/static/uploads/{stored_filename}",
        asset_type=asset_type,
        folder_id=parsed_folder_id,
        size_bytes=len(contents),
        format=format_label,
    )
    db.add(asset)
    await db.commit()
    return await _get_asset_out(db, str(asset.id))


@router.patch("/assets/{asset_id}", response_model=MediaAssetOut)
async def update_media_asset(
    asset_id: str, payload: MediaAssetUpdate, db: AsyncSession = Depends(get_db)
) -> MediaAssetOut:
    asset = await _get_asset(db, asset_id)

    if payload.folder_id is not None:
        await _get_folder(db, str(payload.folder_id))

    data = payload.model_dump(exclude_unset=True, exclude={"translations"})
    for field, value in data.items():
        setattr(asset, field, value)

    if payload.translations is not None:
        await _replace_translations(db, asset.id, payload.translations)
        db.expire(asset, ["translations"])

    await db.commit()
    return await _get_asset_out(db, asset_id)


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_asset(asset_id: str, db: AsyncSession = Depends(get_db)) -> None:
    asset = await _get_asset(db, asset_id)
    stored_path = UPLOAD_DIR / Path(asset.file_url).name
    await db.delete(asset)
    await db.commit()
    stored_path.unlink(missing_ok=True)

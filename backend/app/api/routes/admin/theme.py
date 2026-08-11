"""Admin site-theme management — `/api/v1/admin/theme/*`.

Singleton resource (exactly one `site_theme` row, seeded by the migration)
— PATCH updates fields in place, no create/delete. Logo upload is its own
endpoint since it's a distinct multipart action, not a JSON field update.
"""

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.theme import SiteTheme
from app.schemas.theme import SiteThemeOut, SiteThemeUpdate

router = APIRouter(dependencies=[Depends(require_admin)])

ALLOWED_LOGO_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/svg+xml"}
MAX_LOGO_BYTES = 2 * 1024 * 1024  # 2 MB

UPLOAD_DIR = Path("static") / "uploads"


async def _get_theme(db: AsyncSession) -> SiteTheme:
    result = await db.execute(select(SiteTheme).limit(1))
    return result.scalar_one()


@router.get("", response_model=SiteThemeOut)
async def get_theme(db: AsyncSession = Depends(get_db)) -> SiteThemeOut:
    theme = await _get_theme(db)
    return SiteThemeOut.model_validate(theme)


@router.patch("", response_model=SiteThemeOut)
async def update_theme(
    payload: SiteThemeUpdate, db: AsyncSession = Depends(get_db)
) -> SiteThemeOut:
    theme = await _get_theme(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(theme, field, value)
    await db.commit()
    await db.refresh(theme)
    return SiteThemeOut.model_validate(theme)


@router.post("/logo", response_model=SiteThemeOut)
async def upload_logo(
    db: AsyncSession = Depends(get_db), file: UploadFile = File(...)
) -> SiteThemeOut:
    if file.content_type not in ALLOWED_LOGO_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logo must be a PNG, JPEG, WEBP or SVG image.",
        )

    contents = await file.read()
    if len(contents) > MAX_LOGO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logo must be smaller than 2 MB.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "").suffix
    filename = f"{uuid4()}{suffix}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    theme = await _get_theme(db)
    theme.logo_url = f"/static/uploads/{filename}"
    await db.commit()
    await db.refresh(theme)
    return SiteThemeOut.model_validate(theme)

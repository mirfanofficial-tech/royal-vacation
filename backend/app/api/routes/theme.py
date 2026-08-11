"""Public site theme — `GET /api/v1/theme`, unauthenticated.

Read by both the public `client` site and the admin panel's own sidebar
branding (the uploaded logo applies to both). Mutations live under
`app/api/routes/admin/theme.py` (admin-gated).
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.theme import SiteTheme
from app.schemas.theme import SiteThemeOut

router = APIRouter()


@router.get("", response_model=SiteThemeOut)
async def get_theme(db: AsyncSession = Depends(get_db)) -> SiteThemeOut:
    result = await db.execute(select(SiteTheme).limit(1))
    theme = result.scalar_one()
    return SiteThemeOut.model_validate(theme)

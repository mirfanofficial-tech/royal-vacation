"""Public Genius loyalty data — `/api/v1/genius/*` (unauthenticated).

Read-only view of the active loyalty tiers and their active benefits, consumed
by the public site's /genius page and member pricing. Admin CRUD lives in
`app/api/routes/admin/genius.py`.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.genius import GeniusLevel
from app.schemas.genius import GeniusBenefitPublicOut, GeniusLevelPublicOut

router = APIRouter()


@router.get("/levels", response_model=list[GeniusLevelPublicOut])
async def list_public_levels(db: AsyncSession = Depends(get_db)) -> list[GeniusLevelPublicOut]:
    result = await db.execute(
        select(GeniusLevel).where(GeniusLevel.is_active.is_(True)).order_by(GeniusLevel.tier)
    )
    levels = result.scalars().all()
    return [
        GeniusLevelPublicOut(
            id=level.id,
            slug=level.slug,
            tier=level.tier,
            name=level.name,
            stays_required=level.stays_required,
            discount_percent=level.discount_percent,
            description=level.description,
            benefits=[
                GeniusBenefitPublicOut(label=b.label, description=b.description, icon=b.icon)
                for b in level.benefits
                if b.is_active
            ],
        )
        for level in levels
    ]

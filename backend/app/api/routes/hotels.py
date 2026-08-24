"""Public hotels — `GET /api/v1/hotels`, unauthenticated.

Backs the homepage's curated hotels section with real `hotels` table rows
(VERVOTECH_INTEGRATION.md Stage B) instead of client-side mock data. Only
`Hotel` (curated content) is exposed here — no pricing/rates, since Stage C's
live rates layer doesn't exist yet. Mutations don't exist anywhere: this
table is populated by the content pipeline, not manual entry, matching
`app/api/routes/admin/hotels.py`'s read-only stance.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelOut

router = APIRouter()


@router.get("", response_model=list[HotelOut])
async def list_hotels(db: AsyncSession = Depends(get_db)) -> list[HotelOut]:
    result = await db.execute(select(Hotel).order_by(Hotel.name))
    return [HotelOut.model_validate(h) for h in result.scalars().all()]

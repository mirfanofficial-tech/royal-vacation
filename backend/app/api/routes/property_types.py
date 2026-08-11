"""Public property types — `GET /api/v1/property-types`, unauthenticated.

Backs the homepage's "Browse by property type" section. Mutations live
under `app/api/routes/admin/property_types.py` (admin-gated).
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.property_type import PropertyType
from app.schemas.property_type import PropertyTypeOut

router = APIRouter()


@router.get("", response_model=list[PropertyTypeOut])
async def list_property_types(db: AsyncSession = Depends(get_db)) -> list[PropertyTypeOut]:
    result = await db.execute(
        select(PropertyType)
        .where(PropertyType.is_active.is_(True))
        .order_by(PropertyType.sort_order)
    )
    return [PropertyTypeOut.model_validate(p) for p in result.scalars().all()]

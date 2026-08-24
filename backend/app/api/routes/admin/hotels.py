"""Admin hotel-mapping pipeline visibility — `/api/v1/admin/hotels/*`.

Read-only. VERVOTECH_INTEGRATION.md Stage B's `hotels`/`raw_supplier_hotels`/
`supplier_hotel_links` tables are populated by an offline pipeline (steps
12/13/15), not manual admin entry — there's deliberately no create/update/
delete here, same reasoning as why `admin/modules.py` has no reveal endpoint
for credentials. Until that pipeline runs for real (blocked on supplier/
Vervotech credentials — see the doc's §7), this will correctly show zeros.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.hotel import Hotel, RawSupplierHotel, SupplierHotelLink
from app.schemas.hotel import HotelOut, HotelPipelineStatsOut

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("", response_model=list[HotelOut])
async def list_hotels(db: AsyncSession = Depends(get_db)) -> list[HotelOut]:
    result = await db.execute(select(Hotel).order_by(Hotel.name))
    return [HotelOut.model_validate(h) for h in result.scalars().all()]


@router.get("/stats", response_model=HotelPipelineStatsOut)
async def get_hotel_pipeline_stats(db: AsyncSession = Depends(get_db)) -> HotelPipelineStatsOut:
    mapped_hotels = (await db.execute(select(func.count()).select_from(Hotel))).scalar_one()
    raw_total = (await db.execute(select(func.count()).select_from(RawSupplierHotel))).scalar_one()
    links_total = (
        await db.execute(select(func.count()).select_from(SupplierHotelLink))
    ).scalar_one()

    by_supplier_rows = await db.execute(
        select(RawSupplierHotel.supplier, func.count())
        .group_by(RawSupplierHotel.supplier)
        .order_by(RawSupplierHotel.supplier)
    )

    return HotelPipelineStatsOut(
        mapped_hotels=mapped_hotels,
        raw_supplier_records=raw_total,
        raw_records_by_supplier=dict(by_supplier_rows.all()),
        supplier_links=links_total,
    )

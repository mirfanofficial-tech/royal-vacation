"""Partner (property agent) self-service module — `/api/v1/partner/*`.

Everything here operates on the *current* partner's own records — contrast
with `admin/partners.py`, which is the admin-side view of every partner.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_partner
from app.db.session import get_db
from app.models.user import PartnerProfile, User
from app.schemas.profile import PartnerProfileOut, PartnerProfileSelfUpdate

router = APIRouter(dependencies=[Depends(require_partner)])

_PROPERTIES_NOT_MODELED = (
    "Partner-owned properties aren't modeled yet: the property catalog is an "
    "in-memory demo store with no partner/owner linkage. TODO: back the "
    "property catalog with a DB table that includes an owner_id (partner "
    "user id) before wiring this endpoint up for real."
)
_BOOKINGS_NOT_MODELED = (
    "Bookings aren't modeled yet: no bookings table exists in the schema. "
    "TODO: add a bookings table + model before wiring this endpoint up."
)


async def _get_own_profile(db: AsyncSession, current_user: User) -> PartnerProfile:
    result = await db.execute(
        select(PartnerProfile).where(PartnerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Partner profile not found"
        )
    return profile


@router.get("/profile", response_model=PartnerProfileOut)
async def get_my_profile(
    current_user: User = Depends(require_partner), db: AsyncSession = Depends(get_db)
) -> PartnerProfileOut:
    profile = await _get_own_profile(db, current_user)
    return PartnerProfileOut.model_validate(profile)


@router.put("/profile", response_model=PartnerProfileOut)
async def update_my_profile(
    payload: PartnerProfileSelfUpdate,
    current_user: User = Depends(require_partner),
    db: AsyncSession = Depends(get_db),
) -> PartnerProfileOut:
    profile = await _get_own_profile(db, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return PartnerProfileOut.model_validate(profile)


@router.get("/properties")
async def list_my_properties() -> None:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_PROPERTIES_NOT_MODELED)


@router.post("/properties", status_code=status.HTTP_201_CREATED)
async def create_my_property() -> None:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_PROPERTIES_NOT_MODELED)


@router.get("/bookings")
async def list_my_bookings() -> None:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_BOOKINGS_NOT_MODELED)

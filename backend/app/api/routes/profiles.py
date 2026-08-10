from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_db_admin
from app.db.session import get_db
from app.models.user import PartnerProfile, TravelerProfile, User
from app.schemas.profile import (
    PartnerProfileOut,
    PartnerProfileUpdate,
    TravelerProfileOut,
    TravelerProfileUpdate,
)

router = APIRouter(dependencies=[Depends(require_db_admin)])


async def _get_user(db: AsyncSession, user_id: str) -> User:
    try:
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def _get_partner(db: AsyncSession, user_id: str) -> PartnerProfile:
    user = await _get_user(db, user_id)
    result = await db.execute(
        select(PartnerProfile).where(PartnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Partner profile not found"
        )
    return profile


async def _get_traveler(db: AsyncSession, user_id: str) -> TravelerProfile:
    user = await _get_user(db, user_id)
    result = await db.execute(
        select(TravelerProfile).where(TravelerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Traveler profile not found"
        )
    return profile


@router.get("/partners/{user_id}", response_model=PartnerProfileOut)
async def get_partner_profile(
    user_id: str, db: AsyncSession = Depends(get_db)
) -> PartnerProfileOut:
    profile = await _get_partner(db, user_id)
    return PartnerProfileOut.model_validate(profile)


@router.patch("/partners/{user_id}", response_model=PartnerProfileOut)
async def update_partner_profile(
    user_id: str,
    payload: PartnerProfileUpdate,
    db: AsyncSession = Depends(get_db),
) -> PartnerProfileOut:
    profile = await _get_partner(db, user_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return PartnerProfileOut.model_validate(profile)


@router.get("/travelers/{user_id}", response_model=TravelerProfileOut)
async def get_traveler_profile(
    user_id: str, db: AsyncSession = Depends(get_db)
) -> TravelerProfileOut:
    profile = await _get_traveler(db, user_id)
    return TravelerProfileOut.model_validate(profile)


@router.patch("/travelers/{user_id}", response_model=TravelerProfileOut)
async def update_traveler_profile(
    user_id: str,
    payload: TravelerProfileUpdate,
    db: AsyncSession = Depends(get_db),
) -> TravelerProfileOut:
    profile = await _get_traveler(db, user_id)
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return TravelerProfileOut.model_validate(profile)

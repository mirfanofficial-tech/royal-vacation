"""Admin view of property-agent (partner) accounts — `/api/v1/admin/partners/*`."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import PartnerProfile, User
from app.schemas.profile import PartnerProfileOut, PartnerSummaryOut

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("", response_model=list[PartnerSummaryOut])
async def list_partners(
    db: AsyncSession = Depends(get_db),
    verified: bool | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[PartnerSummaryOut]:
    stmt = (
        select(User, PartnerProfile)
        .outerjoin(PartnerProfile, PartnerProfile.user_id == User.id)
        .where(User.account_type == "partner", User.deleted_at.is_(None))
    )
    if verified is not None:
        stmt = stmt.where(PartnerProfile.is_verified.is_(verified))
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            User.email.ilike(pattern) | PartnerProfile.business_name.ilike(pattern)
        )

    stmt = stmt.order_by(User.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)

    return [
        PartnerSummaryOut(
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            account_status=user.status,
            partner_profile_id=profile.id if profile else None,
            business_name=profile.business_name if profile else None,
            is_verified=profile.is_verified if profile else None,
            verification_status=profile.status if profile else None,
            created_at=user.created_at,
        )
        for user, profile in result.all()
    ]


@router.post("/{user_id}/verify", response_model=PartnerProfileOut)
async def verify_partner(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(require_admin),
) -> PartnerProfileOut:
    try:
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")

    result = await db.execute(select(PartnerProfile).where(PartnerProfile.user_id == uid))
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")

    profile.is_verified = True
    profile.verified_by = current_admin.id
    profile.verified_at = datetime.now(timezone.utc)
    if profile.status == "pending":
        profile.status = "active"

    await db.commit()
    await db.refresh(profile)
    return PartnerProfileOut.model_validate(profile)

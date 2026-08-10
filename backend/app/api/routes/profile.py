"""User profile self-service module — `/api/v1/profile/*`.

Applies to any authenticated account (traveler, partner, or admin) editing
their own record. Contrast with `admin/users.py` (any user, admin-gated) and
`partner.py` (partner-specific business profile).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.routes.common import load_user_with_roles, to_user_out
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User, UserSession
from app.schemas.user import (
    ChangePasswordRequest,
    PreferencesUpdate,
    ProfileUpdate,
    UserOut,
)

router = APIRouter(dependencies=[Depends(get_current_user)])

_BOOKINGS_NOT_MODELED = (
    "Bookings aren't modeled yet: no bookings table exists in the schema. "
    "TODO: add a bookings table + model before wiring this endpoint up."
)


@router.get("", response_model=UserOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> UserOut:
    user = await load_user_with_roles(db, current_user.id)
    return to_user_out(user)


@router.put("", response_model=UserOut)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    user = await load_user_with_roles(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    user = await load_user_with_roles(db, current_user.id)
    return to_user_out(user)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    if current_user.password_hash is None or not verify_password(
        payload.current_password, current_user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect"
        )

    current_user.password_hash = hash_password(payload.new_password)
    # Force re-login everywhere else after a password change.
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == current_user.id, UserSession.is_active.is_(True))
        .values(is_active=False)
    )
    await db.commit()


@router.put("/preferences", response_model=UserOut)
async def update_my_preferences(
    payload: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    user = await load_user_with_roles(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    user = await load_user_with_roles(db, current_user.id)
    return to_user_out(user)


@router.get("/bookings")
async def list_my_bookings() -> None:
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_BOOKINGS_NOT_MODELED)

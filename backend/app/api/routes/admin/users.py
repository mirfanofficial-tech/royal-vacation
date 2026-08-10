"""Admin user management — `/api/v1/admin/users/*`."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_admin, require_super_admin
from app.api.routes.common import load_user_with_roles, to_user_out
from app.core.security import hash_password
from app.db.session import get_db
from app.models.rbac import Role
from app.models.user import (
    User,
    UserActivityLog,
    UserRole,
    UserSession,
)
from app.schemas.session import UserActivityLogOut, UserSessionOut
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserRolesUpdate,
    UserUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


async def _load_user(db: AsyncSession, user_id: str) -> User:
    try:
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await load_user_with_roles(db, uid)


@router.get("", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    account_type: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[UserOut]:
    stmt = (
        select(User)
        .options(selectinload(User.role_assignments).selectinload(UserRole.role))
        .where(User.deleted_at.is_(None))
    )
    if account_type is not None:
        stmt = stmt.where(User.account_type == account_type)
    if status_filter is not None:
        stmt = stmt.where(User.status == status_filter)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            User.email.ilike(pattern)
            | User.first_name.ilike(pattern)
            | User.last_name.ilike(pattern)
            | User.display_name.ilike(pattern)
        )

    stmt = stmt.order_by(User.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return [to_user_out(u) for u in result.scalars().all()]


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> UserOut:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    role_ids = payload.role_ids
    roles: list[Role] = []
    if role_ids:
        result = await db.execute(select(Role).where(Role.id.in_(role_ids)))
        roles = list(result.scalars().all())
        if len(roles) != len(role_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more role ids are invalid",
            )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password) if payload.password else None,
        first_name=payload.first_name,
        last_name=payload.last_name,
        display_name=payload.display_name,
        phone=payload.phone,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        account_type=payload.account_type,
        status=payload.status,
        preferred_currency=payload.preferred_currency,
        preferred_language=payload.preferred_language,
        timezone=payload.timezone,
        country=payload.country,
        city=payload.city,
        address=payload.address,
        zip_code=payload.zip_code,
    )
    user.role_assignments = [
        UserRole(user_id=user.id, role_id=role.id, assigned_by=None) for role in roles
    ]
    db.add(user)
    await db.commit()
    # Reload with role_assignments.role eager-loaded — the objects assigned
    # above only have role_id set, so serializing straight off `user` would
    # lazy-load `.role` outside greenlet context and crash under asyncpg.
    user = await load_user_with_roles(db, user.id)
    return to_user_out(user)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)) -> UserOut:
    user = await _load_user(db, user_id)
    return to_user_out(user)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str, payload: UserUpdate, db: AsyncSession = Depends(get_db)
) -> UserOut:
    user = await _load_user(db, user_id)
    data = payload.model_dump(exclude_unset=True)
    if "password" in data:
        password = data.pop("password")
        if password is not None:
            user.password_hash = hash_password(password)
    for field, value in data.items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return to_user_out(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def soft_delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _super_admin: User = Depends(require_super_admin),
) -> None:
    user = await _load_user(db, user_id)
    user.deleted_at = user.deleted_at or datetime.now(timezone.utc)
    user.status = "deleted"
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id, UserSession.is_active.is_(True))
        .values(is_active=False)
    )
    await db.commit()


@router.post("/{user_id}/suspend", response_model=UserOut)
async def suspend_user(user_id: str, db: AsyncSession = Depends(get_db)) -> UserOut:
    user = await _load_user(db, user_id)
    user.status = "suspended"
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id, UserSession.is_active.is_(True))
        .values(is_active=False)
    )
    await db.commit()
    await db.refresh(user)
    return to_user_out(user)


@router.post("/{user_id}/activate", response_model=UserOut)
async def activate_user(user_id: str, db: AsyncSession = Depends(get_db)) -> UserOut:
    user = await _load_user(db, user_id)
    user.status = "active"
    await db.commit()
    await db.refresh(user)
    return to_user_out(user)


@router.put("/{user_id}/roles", response_model=UserOut)
async def set_user_roles(
    user_id: str, payload: UserRolesUpdate, db: AsyncSession = Depends(get_db)
) -> UserOut:
    user = await _load_user(db, user_id)

    role_ids = payload.role_ids
    if role_ids:
        result = await db.execute(select(Role).where(Role.id.in_(role_ids)))
        roles = list(result.scalars().all())
        if len(roles) != len(role_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more role ids are invalid",
            )
    else:
        roles = []

    await db.execute(
        update(UserRole)
        .where(UserRole.user_id == user.id, UserRole.is_active.is_(True))
        .values(is_active=False)
    )
    for role in roles:
        db.add(UserRole(user_id=user.id, role_id=role.id, assigned_by=None))

    await db.commit()
    user = await load_user_with_roles(db, user.id)
    return to_user_out(user)


@router.get("/{user_id}/sessions", response_model=list[UserSessionOut])
async def list_user_sessions(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    active_only: bool = Query(default=False),
) -> list[UserSessionOut]:
    user = await _load_user(db, user_id)
    stmt = select(UserSession).where(UserSession.user_id == user.id)
    if active_only:
        stmt = stmt.where(UserSession.is_active.is_(True))
    stmt = stmt.order_by(UserSession.created_at.desc())
    result = await db.execute(stmt)
    return [UserSessionOut.model_validate(s) for s in result.scalars().all()]


@router.get("/{user_id}/activity", response_model=list[UserActivityLogOut])
async def list_user_activity(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[UserActivityLogOut]:
    user = await _load_user(db, user_id)
    result = await db.execute(
        select(UserActivityLog)
        .where(UserActivityLog.user_id == user.id)
        .order_by(UserActivityLog.created_at.desc())
        .limit(limit)
    )
    return [UserActivityLogOut.model_validate(a) for a in result.scalars().all()]

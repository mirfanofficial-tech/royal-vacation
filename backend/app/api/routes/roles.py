from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_db_admin
from app.db.session import get_db
from app.models.rbac import Permission, Role, RolePermission
from app.schemas.role import (
    PermissionOut,
    RoleCreate,
    RoleOut,
    RolePermissionsUpdate,
    RoleUpdate,
)

router = APIRouter(dependencies=[Depends(require_db_admin)])


async def _get_role(db: AsyncSession, role_id: str) -> Role:
    try:
        uid = UUID(role_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    result = await db.execute(select(Role).where(Role.id == uid))
    role = result.scalar_one_or_none()
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return role


@router.get("", response_model=list[RoleOut])
async def list_roles(db: AsyncSession = Depends(get_db)) -> list[RoleOut]:
    result = await db.execute(select(Role).order_by(Role.level.desc()))
    return [RoleOut.model_validate(r) for r in result.scalars().all()]


@router.post("", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
async def create_role(payload: RoleCreate, db: AsyncSession = Depends(get_db)) -> RoleOut:
    existing = await db.execute(select(Role).where(Role.name == payload.name))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Role name already exists"
        )
    role = Role(**payload.model_dump())
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return RoleOut.model_validate(role)


@router.get("/{role_id}", response_model=RoleOut)
async def get_role(role_id: str, db: AsyncSession = Depends(get_db)) -> RoleOut:
    role = await _get_role(db, role_id)
    return RoleOut.model_validate(role)


@router.patch("/{role_id}", response_model=RoleOut)
async def update_role(
    role_id: str, payload: RoleUpdate, db: AsyncSession = Depends(get_db)
) -> RoleOut:
    role = await _get_role(db, role_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(role, field, value)
    await db.commit()
    await db.refresh(role)
    return RoleOut.model_validate(role)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: str, db: AsyncSession = Depends(get_db)) -> None:
    role = await _get_role(db, role_id)
    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="System roles cannot be deleted",
        )
    await db.delete(role)
    await db.commit()


@router.get("/{role_id}/permissions", response_model=list[PermissionOut])
async def get_role_permissions(
    role_id: str, db: AsyncSession = Depends(get_db)
) -> list[PermissionOut]:
    await _get_role(db, role_id)
    result = await db.execute(
        select(Permission)
        .join(RolePermission, RolePermission.module == Permission.resource)
        .where(
            RolePermission.role_id == UUID(role_id),
            RolePermission.action == Permission.action,
        )
        .order_by(Permission.resource, Permission.action)
    )
    return [PermissionOut.model_validate(p) for p in result.scalars().all()]


@router.put("/{role_id}/permissions", response_model=list[PermissionOut])
async def set_role_permissions(
    role_id: str, payload: RolePermissionsUpdate, db: AsyncSession = Depends(get_db)
) -> list[PermissionOut]:
    await _get_role(db, role_id)

    existing = await db.execute(
        select(RolePermission).where(RolePermission.role_id == UUID(role_id))
    )
    for row in existing.scalars().all():
        await db.delete(row)

    for perm in payload.permissions:
        db.add(
            RolePermission(role_id=UUID(role_id), module=perm.module, action=perm.action)
        )
    await db.commit()

    result = await db.execute(
        select(Permission)
        .join(RolePermission, RolePermission.module == Permission.resource)
        .where(
            RolePermission.role_id == UUID(role_id),
            RolePermission.action == Permission.action,
        )
        .order_by(Permission.resource, Permission.action)
    )
    return [PermissionOut.model_validate(p) for p in result.scalars().all()]

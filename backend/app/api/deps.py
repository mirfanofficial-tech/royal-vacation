from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.rbac import Role
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """DB-backed identity check. Every user-management endpoint sits behind this."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        user_id = UUID(payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if user.status in ("suspended", "deleted"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is no longer active",
        )

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.account_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


async def require_super_admin(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Stricter than `require_admin`: only accounts holding the `super_admin` role."""
    result = await db.execute(
        select(UserRole)
        .join(Role, Role.id == UserRole.role_id)
        .where(
            UserRole.user_id == current_user.id,
            UserRole.is_active.is_(True),
            Role.name == "super_admin",
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required",
        )
    return current_user


async def require_partner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.account_type != "partner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Partner account required",
        )
    return current_user

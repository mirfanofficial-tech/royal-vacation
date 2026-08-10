"""Small helpers shared across the user-management route modules
(auth, admin/users, profile) so response shaping and role-eager-loading
aren't duplicated in each one.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User, UserRole
from app.schemas.user import UserOut


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        display_name=user.display_name,
        phone=user.phone,
        account_type=user.account_type,
        status=user.status,
        email_verified_at=user.email_verified_at,
        preferred_currency=user.preferred_currency,
        preferred_language=user.preferred_language,
        timezone=user.timezone,
        country=user.country,
        city=user.city,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
        roles=[
            assignment.role.name
            for assignment in user.role_assignments
            if assignment.is_active
        ],
    )


async def load_user_with_roles(db: AsyncSession, user_id: UUID) -> User:
    result = await db.execute(
        select(User)
        .options(selectinload(User.role_assignments).selectinload(UserRole.role))
        .where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

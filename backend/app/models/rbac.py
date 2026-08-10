from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class Role(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    is_system: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'active'"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("status IN ('active', 'inactive')", name="roles_status_check"),
        CheckConstraint("level >= 0", name="roles_level_range"),
    )

    assignments: Mapped[list["UserRole"]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan",
    )
    permissions: Mapped[list["RolePermission"]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan",
    )


class RolePermission(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )
    module: Mapped[str] = mapped_column(String(30), nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "module IN ('dashboard','properties','bookings','guests','modules',"
            "'cms','blog','reports','payments','settings','roles')",
            name="role_permissions_module_check",
        ),
        CheckConstraint(
            "action IN ('view','create','edit','delete')",
            name="role_permissions_action_check",
        ),
        UniqueConstraint("role_id", "module", "action", name="role_permissions_unique"),
        Index("idx_role_permissions_role", "role_id"),
        Index("idx_role_permissions_module", "module"),
    )

    role: Mapped[Role] = relationship(back_populates="permissions")


class Permission(UUIDPrimaryKeyMixin, Base):
    """Definition catalog / registry — NOT an enforcement table.

    Authorization always goes through `role_permissions`. This table only
    documents the full 11 modules x 4 actions cross product for UI labels,
    audits and docs (see sql/004_permissions.sql).
    """

    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    resource: Mapped[str] = mapped_column(String(30), nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "resource IN ('dashboard','properties','bookings','guests','modules',"
            "'cms','blog','reports','payments','settings','roles')",
            name="permissions_resource_check",
        ),
        CheckConstraint(
            "action IN ('view','create','edit','delete')",
            name="permissions_action_check",
        ),
        Index("idx_permissions_resource_action", "resource", "action"),
    )

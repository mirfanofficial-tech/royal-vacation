from datetime import datetime, date
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    display_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    profile_picture: Mapped[str | None] = mapped_column(String(500))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(20))
    account_type: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'traveler'"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'pending'"),
        nullable=False,
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    phone_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    two_factor_enabled: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    two_factor_secret: Mapped[str | None] = mapped_column(String(255))
    login_attempts: Mapped[int] = mapped_column(
        Integer,
        server_default=text("0"),
        nullable=False,
    )
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_ip_address: Mapped[object | None] = mapped_column(INET)
    preferred_currency: Mapped[str] = mapped_column(
        String(3),
        server_default=text("'AED'"),
        nullable=False,
    )
    preferred_language: Mapped[str] = mapped_column(
        String(10),
        server_default=text("'en'"),
        nullable=False,
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        server_default=text("'Asia/Dubai'"),
        nullable=False,
    )
    country: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))
    address: Mapped[str | None] = mapped_column(Text)
    zip_code: Mapped[str | None] = mapped_column(String(20))
    invited_by: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "gender IN ('male', 'female', 'prefer_not_to_say')",
            name="users_gender_check",
        ),
        CheckConstraint(
            "account_type IN ('traveler', 'partner', 'admin')",
            name="users_account_type_check",
        ),
        CheckConstraint(
            "status IN ('pending', 'active', 'invited', 'inactive', 'suspended', 'deleted')",
            name="users_status_check",
        ),
        ForeignKeyConstraint(
            ["preferred_currency"], ["currencies.code"], name="users_currency_fk"
        ),
        ForeignKeyConstraint(
            ["preferred_language"], ["languages.code"], name="users_language_fk"
        ),
        Index("idx_users_account_type_status", "account_type", "status"),
        Index("idx_users_created_at", "created_at"),
    )

    role_assignments: Mapped[list["UserRole"]] = relationship(
        back_populates="user",
        foreign_keys="UserRole.user_id",
        cascade="all, delete-orphan",
    )
    sessions: Mapped[list["UserSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    login_history: Mapped[list["UserLoginHistory"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    activity_logs: Mapped[list["UserActivityLog"]] = relationship(
        back_populates="user",
    )
    partner_profile: Mapped["PartnerProfile | None"] = relationship(
        back_populates="user",
        foreign_keys="PartnerProfile.user_id",
        uselist=False,
    )
    traveler_profile: Mapped["TravelerProfile | None"] = relationship(
        back_populates="user",
        uselist=False,
    )


class UserRole(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "user_roles"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    role_id: Mapped[UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )
    assigned_by: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "expires_at IS NULL OR expires_at > assigned_at",
            name="user_roles_expires_check",
        ),
        Index("idx_user_roles_user", "user_id"),
        Index("idx_user_roles_role", "role_id"),
        Index(
            "uq_user_roles_active",
            "user_id",
            "role_id",
            unique=True,
            postgresql_where=text("is_active"),
        ),
    )

    user: Mapped[User] = relationship(
        back_populates="role_assignments", foreign_keys=[user_id]
    )
    role: Mapped["Role"] = relationship(back_populates="assignments")


class UserSession(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "user_sessions"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    session_token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    refresh_token: Mapped[str | None] = mapped_column(String(255), unique=True)
    device_type: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'desktop'"),
        nullable=False,
    )
    device_name: Mapped[str | None] = mapped_column(String(255))
    browser: Mapped[str | None] = mapped_column(String(100))
    os: Mapped[str | None] = mapped_column(String(100))
    ip_address: Mapped[object | None] = mapped_column(INET)
    location: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "device_type IN ('desktop', 'mobile', 'tablet', 'other')",
            name="user_sessions_device_type_check",
        ),
        CheckConstraint(
            "expires_at > created_at",
            name="user_sessions_expires_check",
        ),
        Index("idx_user_sessions_user", "user_id"),
        Index(
            "idx_user_sessions_active",
            "user_id",
            postgresql_where=text("is_active"),
        ),
        Index("idx_user_sessions_expires", "expires_at"),
    )

    user: Mapped[User] = relationship(back_populates="sessions")


class UserLoginHistory(UUIDPrimaryKeyMixin, Base):
    """Append-only auth audit log (deliberately NO updated_at / trigger)."""

    __tablename__ = "user_login_history"

    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    email: Mapped[str | None] = mapped_column(String(255))
    login_type: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'email'"),
        nullable=False,
    )
    ip_address: Mapped[object | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    failure_reason: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "login_type IN ('email', 'google', 'apple', 'facebook', 'phone', 'token')",
            name="user_login_history_type_check",
        ),
        CheckConstraint(
            "status IN ('success', 'failed', 'locked')",
            name="user_login_history_status_check",
        ),
        Index("idx_login_history_user", "user_id"),
        Index("idx_login_history_created", "created_at"),
        Index(
            "idx_login_history_email_failed",
            "email",
            postgresql_where=text("status IN ('failed', 'locked')"),
        ),
    )

    user: Mapped[User | None] = relationship(back_populates="login_history")


class UserActivityLog(UUIDPrimaryKeyMixin, Base):
    """Append-only action audit trail (deliberately NO updated_at / trigger)."""

    __tablename__ = "user_activity_logs"

    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    session_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("user_sessions.id", ondelete="SET NULL")
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(50))
    resource_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True))
    details: Mapped[object | None] = mapped_column(JSONB)
    ip_address: Mapped[object | None] = mapped_column(INET)
    user_agent: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("idx_activity_user", "user_id", "created_at"),
        Index("idx_activity_created", "created_at"),
        Index("idx_activity_resource", "resource_type", "resource_id"),
    )

    user: Mapped[User | None] = relationship(back_populates="activity_logs")


class PartnerProfile(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "partner_profiles"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_registration_number: Mapped[str | None] = mapped_column(
        String(100), unique=True
    )
    tax_id: Mapped[str | None] = mapped_column(String(100))
    business_license_url: Mapped[str | None] = mapped_column(String(500))
    logo_url: Mapped[str | None] = mapped_column(String(500))
    website: Mapped[str | None] = mapped_column(String(255))
    business_phone: Mapped[str | None] = mapped_column(String(50))
    business_email: Mapped[str | None] = mapped_column(String(255))
    business_address: Mapped[str | None] = mapped_column(Text)
    business_city: Mapped[str | None] = mapped_column(String(100))
    business_country: Mapped[str | None] = mapped_column(String(100))

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    verification_documents: Mapped[object | None] = mapped_column(JSONB)
    verification_notes: Mapped[str | None] = mapped_column(Text)
    verified_by: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    commission_rate: Mapped[object] = mapped_column(
        Numeric(5, 2),
        server_default=text("10.00"),
        nullable=False,
    )
    payment_terms: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'monthly'"),
        nullable=False,
    )
    auto_confirm_bookings: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )
    max_cancellation_days: Mapped[int] = mapped_column(
        Integer,
        server_default=text("7"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'pending'"),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'active', 'suspended', 'terminated', 'rejected')",
            name="partner_profiles_status_check",
        ),
        CheckConstraint(
            "payment_terms IN ('weekly', 'biweekly', 'monthly')",
            name="partner_profiles_payment_terms_check",
        ),
        CheckConstraint(
            "commission_rate >= 0 AND commission_rate <= 100",
            name="partner_profiles_commission_check",
        ),
        CheckConstraint(
            "max_cancellation_days >= 0",
            name="partner_profiles_max_cancellation_check",
        ),
        Index("idx_partner_profiles_status", "status"),
    )

    user: Mapped[User] = relationship(
        back_populates="partner_profile", foreign_keys=[user_id]
    )


class TravelerProfile(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "traveler_profiles"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    loyalty_points: Mapped[int] = mapped_column(
        Integer,
        server_default=text("0"),
        nullable=False,
    )
    loyalty_tier: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'bronze'"),
        nullable=False,
    )
    total_bookings: Mapped[int] = mapped_column(
        Integer,
        server_default=text("0"),
        nullable=False,
    )
    total_spent: Mapped[object] = mapped_column(
        Numeric(14, 2),
        server_default=text("0"),
        nullable=False,
    )
    preferred_room_type: Mapped[str | None] = mapped_column(String(50))
    preferred_meal_plan: Mapped[str | None] = mapped_column(String(50))
    passport_number: Mapped[str | None] = mapped_column(String(50))
    passport_expiry: Mapped[date | None] = mapped_column(Date)
    nationality: Mapped[str | None] = mapped_column(String(100))
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255))
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(50))
    preferred_airlines: Mapped[object | None] = mapped_column(JSONB)
    preferred_hotels: Mapped[object | None] = mapped_column(JSONB)
    special_requests: Mapped[str | None] = mapped_column(Text)
    newsletter_subscribed: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("true"),
        nullable=False,
    )
    marketing_consent_given: Mapped[bool] = mapped_column(
        Boolean,
        server_default=text("false"),
        nullable=False,
    )
    marketing_consent_given_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )

    __table_args__ = (
        CheckConstraint(
            "loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')",
            name="traveler_profiles_loyalty_tier_check",
        ),
        CheckConstraint(
            "loyalty_points >= 0",
            name="traveler_profiles_loyalty_points_check",
        ),
        CheckConstraint(
            "total_bookings >= 0",
            name="traveler_profiles_total_bookings_check",
        ),
        CheckConstraint(
            "total_spent >= 0",
            name="traveler_profiles_total_spent_check",
        ),
        CheckConstraint(
            "NOT marketing_consent_given OR marketing_consent_given_at IS NOT NULL",
            name="traveler_profiles_consent_check",
        ),
        Index("idx_traveler_profiles_tier", "loyalty_tier"),
    )

    user: Mapped[User] = relationship(back_populates="traveler_profile")

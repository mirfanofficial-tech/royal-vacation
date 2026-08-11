from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class StaySetting(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "stay_settings"

    setting_type: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )

    translations: Mapped[list["StaySettingTranslation"]] = relationship(
        back_populates="stay_setting",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint(
            "setting_type IN ('stay_amenity', 'room_type', 'room_amenity', 'accommodation', 'board')",
            name="stay_settings_type_check",
        ),
    )


class StaySettingTranslation(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "stay_setting_translations"

    stay_setting_id: Mapped[str] = mapped_column(
        ForeignKey("stay_settings.id", ondelete="CASCADE"), nullable=False
    )
    language_code: Mapped[str] = mapped_column(
        ForeignKey("languages.code", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(Text, nullable=False)

    stay_setting: Mapped[StaySetting] = relationship(back_populates="translations")

    __table_args__ = (
        UniqueConstraint("stay_setting_id", "language_code", name="stay_setting_translations_unique"),
    )

from sqlalchemy import Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, CreatedAtMixin, UpdatedAtMixin, UUIDPrimaryKeyMixin


class ContactMessage(UUIDPrimaryKeyMixin, CreatedAtMixin, UpdatedAtMixin, Base):
    __tablename__ = "contact_messages"

    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    booking_reference: Mapped[str | None] = mapped_column(Text)
    topic: Mapped[str] = mapped_column(Text, nullable=False)
    preferred_channel: Mapped[str] = mapped_column(
        Text, server_default=text("'email'"), nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, server_default=text("'new'"), nullable=False)

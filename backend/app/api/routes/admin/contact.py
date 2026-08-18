"""Admin Contact inbox — `/api/v1/admin/contact/*`.

Read/triage access to messages submitted through the public
`POST /api/v1/contact` concierge form.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageOut, ContactMessageStatusUpdate

router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_message(db: AsyncSession, message_id: str) -> ContactMessage:
    try:
        uid = UUID(message_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == uid))
    message = result.scalar_one_or_none()
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return message


@router.get("", response_model=list[ContactMessageOut])
async def list_contact_messages(
    status_filter: str | None = Query(default=None, alias="status"),
    topic: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[ContactMessageOut]:
    query = select(ContactMessage).order_by(ContactMessage.created_at.desc())
    if status_filter:
        query = query.where(ContactMessage.status == status_filter)
    if topic:
        query = query.where(ContactMessage.topic == topic)
    result = await db.execute(query)
    return [ContactMessageOut.model_validate(row) for row in result.scalars().all()]


@router.patch("/{message_id}", response_model=ContactMessageOut)
async def update_contact_message_status(
    message_id: str, payload: ContactMessageStatusUpdate, db: AsyncSession = Depends(get_db)
) -> ContactMessageOut:
    message = await _get_message(db, message_id)
    message.status = payload.status
    await db.commit()
    await db.refresh(message)
    return ContactMessageOut.model_validate(message)

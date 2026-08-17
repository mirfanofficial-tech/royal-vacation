"""Public Contact — `/api/v1/contact`, unauthenticated.

Backs the client site's `/contact` concierge form. Every submission is
persisted as a `ContactMessage` row (status starts `'new'`) — there is no
admin UI for these yet, so triage happens by querying the table directly
until one is built.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.contact import ContactMessage
from app.schemas.contact import ContactMessageCreate, ContactMessageOut

router = APIRouter()


@router.post("", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    payload: ContactMessageCreate, db: AsyncSession = Depends(get_db)
) -> ContactMessageOut:
    message = ContactMessage(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        booking_reference=payload.booking_reference,
        topic=payload.topic,
        preferred_channel=payload.preferred_channel,
        message=payload.message,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return ContactMessageOut.model_validate(message)

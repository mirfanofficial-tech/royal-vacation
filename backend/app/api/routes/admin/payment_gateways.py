"""Admin payment-gateway management — `/api/v1/admin/payment-gateways/*`.

Credentials are Fernet-encrypted at rest (app/core/crypto.py) and never
returned in full — reads only ever see a masked preview of secret fields.
There is deliberately no "reveal" endpoint; to change a secret, set a new
one (leaving a field unset on update keeps the current value).
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.crypto import decrypt_json, encrypt_json
from app.db.session import get_db
from app.models.payment import PaymentGateway
from app.schemas.payment import (
    PaymentGatewayCreate,
    PaymentGatewayCredentialsInput,
    PaymentGatewayCredentialsOut,
    PaymentGatewayOut,
    PaymentGatewayUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def _mask(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 4:
        return "•" * len(value)
    return "•" * (len(value) - 4) + value[-4:]


def _to_out(gateway: PaymentGateway) -> PaymentGatewayOut:
    creds = decrypt_json(gateway.credentials_encrypted)
    return PaymentGatewayOut(
        id=gateway.id,
        code=gateway.code,
        name=gateway.name,
        description=gateway.description,
        status=gateway.status,
        is_default=gateway.is_default,
        currencies=gateway.currencies,
        credentials=PaymentGatewayCredentialsOut(
            public_key=creds.get("public_key"),
            merchant_id=creds.get("merchant_id"),
            secret_key_preview=_mask(creds.get("secret_key")),
            webhook_secret_preview=_mask(creds.get("webhook_secret")),
        ),
        success_url=gateway.success_url,
        cancel_url=gateway.cancel_url,
        webhook_url=gateway.webhook_url,
        created_at=gateway.created_at,
        updated_at=gateway.updated_at,
    )


def _merge_credentials(
    existing_encrypted: str | None, incoming: PaymentGatewayCredentialsInput
) -> str:
    current = decrypt_json(existing_encrypted)
    current.update(incoming.model_dump(exclude_unset=True, exclude_none=True))
    return encrypt_json(current)


async def _get_gateway(db: AsyncSession, gateway_id: str) -> PaymentGateway:
    try:
        uid = UUID(gateway_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment gateway not found"
        )
    result = await db.execute(select(PaymentGateway).where(PaymentGateway.id == uid))
    gateway = result.scalar_one_or_none()
    if gateway is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Payment gateway not found"
        )
    return gateway


@router.get("", response_model=list[PaymentGatewayOut])
async def list_gateways(db: AsyncSession = Depends(get_db)) -> list[PaymentGatewayOut]:
    result = await db.execute(select(PaymentGateway).order_by(PaymentGateway.name))
    return [_to_out(g) for g in result.scalars().all()]


@router.post("", response_model=PaymentGatewayOut, status_code=status.HTTP_201_CREATED)
async def create_gateway(
    payload: PaymentGatewayCreate, db: AsyncSession = Depends(get_db)
) -> PaymentGatewayOut:
    existing = await db.execute(select(PaymentGateway).where(PaymentGateway.code == payload.code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Gateway code already exists"
        )

    gateway = PaymentGateway(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        currencies=payload.currencies,
        credentials_encrypted=encrypt_json(payload.credentials.model_dump(exclude_none=True)),
        success_url=payload.success_url,
        cancel_url=payload.cancel_url,
        webhook_url=payload.webhook_url,
    )
    db.add(gateway)

    if payload.is_default:
        await db.flush()
        await db.execute(update(PaymentGateway).values(is_default=False))
        gateway.is_default = True

    await db.commit()
    await db.refresh(gateway)
    return _to_out(gateway)


@router.get("/{gateway_id}", response_model=PaymentGatewayOut)
async def get_gateway(gateway_id: str, db: AsyncSession = Depends(get_db)) -> PaymentGatewayOut:
    gateway = await _get_gateway(db, gateway_id)
    return _to_out(gateway)


@router.patch("/{gateway_id}", response_model=PaymentGatewayOut)
async def update_gateway(
    gateway_id: str, payload: PaymentGatewayUpdate, db: AsyncSession = Depends(get_db)
) -> PaymentGatewayOut:
    gateway = await _get_gateway(db, gateway_id)
    for field, value in payload.model_dump(exclude_unset=True, exclude={"credentials"}).items():
        setattr(gateway, field, value)

    if payload.credentials is not None:
        gateway.credentials_encrypted = _merge_credentials(
            gateway.credentials_encrypted, payload.credentials
        )

    await db.commit()
    await db.refresh(gateway)
    return _to_out(gateway)


@router.delete("/{gateway_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gateway(gateway_id: str, db: AsyncSession = Depends(get_db)) -> None:
    gateway = await _get_gateway(db, gateway_id)
    await db.delete(gateway)
    await db.commit()


@router.post("/{gateway_id}/set-default", response_model=PaymentGatewayOut)
async def set_default_gateway(
    gateway_id: str, db: AsyncSession = Depends(get_db)
) -> PaymentGatewayOut:
    gateway = await _get_gateway(db, gateway_id)
    await db.execute(update(PaymentGateway).values(is_default=False))
    gateway.is_default = True
    await db.commit()
    await db.refresh(gateway)
    return _to_out(gateway)

"""Admin Promo Codes — `/api/v1/admin/promo-codes/*`.

Full CRUD for promotional discount codes. The booking service validates the
guest's submitted code against these rows, so codes created here are what the
checkout actually accepts/charges with.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.promo_code import PromoCode
from app.schemas.promo_code import PromoCodeCreate, PromoCodeOut, PromoCodeUpdate

router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_promo_code(db: AsyncSession, promo_code_id: str) -> PromoCode:
    try:
        uid = UUID(promo_code_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promo code not found"
        )
    result = await db.execute(select(PromoCode).where(PromoCode.id == uid))
    promo_code = result.scalar_one_or_none()
    if promo_code is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promo code not found"
        )
    return promo_code


@router.get("", response_model=list[PromoCodeOut])
async def list_promo_codes(db: AsyncSession = Depends(get_db)) -> list[PromoCodeOut]:
    result = await db.execute(select(PromoCode).order_by(PromoCode.created_at.desc()))
    return [PromoCodeOut.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=PromoCodeOut, status_code=status.HTTP_201_CREATED)
async def create_promo_code(
    payload: PromoCodeCreate, db: AsyncSession = Depends(get_db)
) -> PromoCodeOut:
    normalized = payload.code.strip().upper()
    existing = await db.execute(select(PromoCode).where(PromoCode.code == normalized))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Promo code already exists"
        )
    promo_code = PromoCode(
        **payload.model_dump(exclude={"code"}), code=normalized
    )
    db.add(promo_code)
    await db.commit()
    await db.refresh(promo_code)
    return PromoCodeOut.model_validate(promo_code)


@router.get("/{promo_code_id}", response_model=PromoCodeOut)
async def get_promo_code(
    promo_code_id: str, db: AsyncSession = Depends(get_db)
) -> PromoCodeOut:
    promo_code = await _get_promo_code(db, promo_code_id)
    return PromoCodeOut.model_validate(promo_code)


@router.patch("/{promo_code_id}", response_model=PromoCodeOut)
async def update_promo_code(
    promo_code_id: str, payload: PromoCodeUpdate, db: AsyncSession = Depends(get_db)
) -> PromoCodeOut:
    promo_code = await _get_promo_code(db, promo_code_id)
    fields = payload.model_dump(exclude_unset=True)
    new_code = fields.get("code")
    if new_code is not None:
        normalized = new_code.strip().upper()
        if normalized != promo_code.code:
            clash = await db.execute(
                select(PromoCode).where(PromoCode.code == normalized)
            )
            if clash.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Promo code already exists"
                )
        fields["code"] = normalized
    for field, value in fields.items():
        setattr(promo_code, field, value)
    await db.commit()
    await db.refresh(promo_code)
    return PromoCodeOut.model_validate(promo_code)


@router.delete("/{promo_code_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promo_code(promo_code_id: str, db: AsyncSession = Depends(get_db)) -> None:
    promo_code = await _get_promo_code(db, promo_code_id)
    await db.delete(promo_code)
    await db.commit()

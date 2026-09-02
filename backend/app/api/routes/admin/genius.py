"""Admin Genius loyalty configuration — `/api/v1/admin/genius/*`.

Full CRUD over loyalty tiers and their benefits for platform staff. The public
read-only counterpart lives in `app/api/routes/genius.py`.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.genius import GeniusLevel, GeniusLevelBenefit
from app.schemas.genius import (
    GeniusBenefitCreate,
    GeniusLevelCreate,
    GeniusLevelOut,
    GeniusLevelUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def _slugify(value: str) -> str:
    return "".join(c if c.isalnum() or c == "-" else "-" for c in value.strip().lower()).strip("-")


async def _get_level(db: AsyncSession, level_id: str) -> GeniusLevel:
    try:
        uid = UUID(level_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genius level not found")
    result = await db.execute(select(GeniusLevel).where(GeniusLevel.id == uid))
    level = result.scalar_one_or_none()
    if level is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genius level not found")
    return level


def _apply_benefits(level: GeniusLevel, benefits: list[GeniusBenefitCreate]) -> None:
    """Reconcile a level's benefit list against the payload — update rows matched
    by id, add new ones, and drop anything not listed (delete-orphan cascade)."""
    existing = {b.id: b for b in level.benefits}
    rebuilt: list[GeniusLevelBenefit] = []
    for index, item in enumerate(benefits):
        row = existing.get(item.id) if item.id else None
        if row is None:
            row = GeniusLevelBenefit(level_id=level.id)
        row.label = item.label
        row.description = item.description
        row.icon = item.icon
        row.sort_order = item.sort_order if item.sort_order else index
        row.is_active = item.is_active
        rebuilt.append(row)
    level.benefits[:] = rebuilt


@router.get("/levels", response_model=list[GeniusLevelOut])
async def list_levels(db: AsyncSession = Depends(get_db)) -> list[GeniusLevelOut]:
    result = await db.execute(select(GeniusLevel).order_by(GeniusLevel.tier))
    return [GeniusLevelOut.model_validate(x) for x in result.scalars().all()]


@router.post("/levels", response_model=GeniusLevelOut, status_code=status.HTTP_201_CREATED)
async def create_level(payload: GeniusLevelCreate, db: AsyncSession = Depends(get_db)) -> GeniusLevelOut:
    slug = payload.slug or _slugify(payload.name) or f"level-{payload.tier}"
    for column, value in (("tier", payload.tier), ("slug", slug)):
        clash = await db.execute(
            select(GeniusLevel).where(getattr(GeniusLevel, column) == value)
        )
        if clash.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A Genius level with this {column} already exists",
            )

    level = GeniusLevel(
        tier=payload.tier,
        slug=slug,
        name=payload.name,
        stays_required=payload.stays_required,
        discount_percent=payload.discount_percent,
        description=payload.description,
        is_active=payload.is_active,
    )
    for index, item in enumerate(payload.benefits):
        level.benefits.append(
            GeniusLevelBenefit(
                label=item.label,
                description=item.description,
                icon=item.icon,
                sort_order=item.sort_order if item.sort_order else index,
                is_active=item.is_active,
            )
        )
    db.add(level)
    await db.commit()
    await db.refresh(level)
    return GeniusLevelOut.model_validate(level)


@router.get("/levels/{level_id}", response_model=GeniusLevelOut)
async def get_level(level_id: str, db: AsyncSession = Depends(get_db)) -> GeniusLevelOut:
    return GeniusLevelOut.model_validate(await _get_level(db, level_id))


@router.patch("/levels/{level_id}", response_model=GeniusLevelOut)
async def update_level(
    level_id: str, payload: GeniusLevelUpdate, db: AsyncSession = Depends(get_db)
) -> GeniusLevelOut:
    level = await _get_level(db, level_id)
    data = payload.model_dump(exclude_unset=True)
    benefits = data.pop("benefits", None)

    if "slug" in data and data["slug"]:
        data["slug"] = _slugify(data["slug"])

    for column in ("tier", "slug"):
        if column in data and data[column] is not None and data[column] != getattr(level, column):
            clash = await db.execute(
                select(GeniusLevel).where(getattr(GeniusLevel, column) == data[column])
            )
            if clash.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A Genius level with this {column} already exists",
                )

    for field, value in data.items():
        setattr(level, field, value)

    if benefits is not None:
        _apply_benefits(level, [GeniusBenefitCreate.model_validate(b) for b in benefits])

    await db.commit()
    await db.refresh(level)
    return GeniusLevelOut.model_validate(level)


@router.delete("/levels/{level_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_level(level_id: str, db: AsyncSession = Depends(get_db)) -> None:
    level = await _get_level(db, level_id)
    await db.delete(level)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Genius level can't be deleted right now.",
        )

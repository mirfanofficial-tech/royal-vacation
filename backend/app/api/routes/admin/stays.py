"""Admin Stays Config — `/api/v1/admin/stays/settings/*`.

One table (`stay_settings`) backs all 5 setting types (Stay Amenity, Room
Type, Room Amenity, Accommodation, Boards) — the type is just a field, not a
separate table, since the types behave identically. Translations are a
normalized child table keyed by the real `languages.code`, not a JSONB blob.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.stays import StaySetting, StaySettingTranslation
from app.schemas.stays import StaySettingCreate, StaySettingOut, StaySettingUpdate

router = APIRouter(dependencies=[Depends(require_admin)])


def _to_out(setting: StaySetting) -> StaySettingOut:
    return StaySettingOut(
        id=setting.id,
        setting_type=setting.setting_type,
        name=setting.name,
        is_active=setting.is_active,
        translations={t.language_code: t.value for t in setting.translations},
        created_at=setting.created_at,
        updated_at=setting.updated_at,
    )


async def _get_setting(db: AsyncSession, setting_id: str) -> StaySetting:
    try:
        uid = UUID(setting_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stay setting not found")
    result = await db.execute(select(StaySetting).where(StaySetting.id == uid))
    setting = result.scalar_one_or_none()
    if setting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stay setting not found")
    return setting


async def _replace_translations(
    db: AsyncSession, setting_id: UUID, translations: dict[str, str]
) -> None:
    await db.execute(
        delete(StaySettingTranslation).where(StaySettingTranslation.stay_setting_id == setting_id)
    )
    for language_code, value in translations.items():
        if not value.strip():
            continue
        db.add(
            StaySettingTranslation(
                stay_setting_id=setting_id, language_code=language_code, value=value
            )
        )


@router.get("", response_model=list[StaySettingOut])
async def list_stay_settings(
    setting_type: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[StaySettingOut]:
    query = select(StaySetting).order_by(StaySetting.name)
    if setting_type:
        query = query.where(StaySetting.setting_type == setting_type)
    result = await db.execute(query)
    return [_to_out(s) for s in result.scalars().all()]


@router.post("", response_model=StaySettingOut, status_code=status.HTTP_201_CREATED)
async def create_stay_setting(
    payload: StaySettingCreate, db: AsyncSession = Depends(get_db)
) -> StaySettingOut:
    setting = StaySetting(
        setting_type=payload.setting_type, name=payload.name, is_active=payload.is_active
    )
    db.add(setting)
    await db.flush()

    await _replace_translations(db, setting.id, payload.translations)

    await db.commit()
    setting = await _get_setting(db, str(setting.id))
    return _to_out(setting)


@router.get("/{setting_id}", response_model=StaySettingOut)
async def get_stay_setting(setting_id: str, db: AsyncSession = Depends(get_db)) -> StaySettingOut:
    setting = await _get_setting(db, setting_id)
    return _to_out(setting)


@router.patch("/{setting_id}", response_model=StaySettingOut)
async def update_stay_setting(
    setting_id: str, payload: StaySettingUpdate, db: AsyncSession = Depends(get_db)
) -> StaySettingOut:
    setting = await _get_setting(db, setting_id)
    data = payload.model_dump(exclude_unset=True, exclude={"translations"})
    for field, value in data.items():
        setattr(setting, field, value)

    if payload.translations is not None:
        await _replace_translations(db, setting.id, payload.translations)
        # `setting.translations` was eager-loaded (lazy="selectin") by
        # `_get_setting` above; the bulk delete/insert in
        # `_replace_translations` bypasses the ORM identity map, so without
        # this the stale in-session collection would be returned below
        # instead of the rows we just wrote.
        db.expire(setting, ["translations"])

    await db.commit()
    setting = await _get_setting(db, setting_id)
    return _to_out(setting)


@router.delete("/{setting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stay_setting(setting_id: str, db: AsyncSession = Depends(get_db)) -> None:
    setting = await _get_setting(db, setting_id)
    await db.delete(setting)
    await db.commit()

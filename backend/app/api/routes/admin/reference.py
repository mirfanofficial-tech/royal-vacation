"""Admin reference-data management — `/api/v1/admin/reference/*`.

Full CRUD over currencies/languages/countries for platform staff, alongside
the public read-only `/api/v1/reference/*` routes (unauthenticated, active
rows only) used by booking flows — that file is untouched by this one.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.reference import Country, Currency, Language
from app.schemas.reference import (
    CountryCreate,
    CountryOut,
    CountryUpdate,
    CurrencyCreate,
    CurrencyOut,
    CurrencyUpdate,
    LanguageCreate,
    LanguageOut,
    LanguageUpdate,
)

currencies_router = APIRouter(dependencies=[Depends(require_admin)])
languages_router = APIRouter(dependencies=[Depends(require_admin)])
countries_router = APIRouter(dependencies=[Depends(require_admin)])


async def _get_currency(db: AsyncSession, currency_id: str) -> Currency:
    try:
        uid = UUID(currency_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
    result = await db.execute(select(Currency).where(Currency.id == uid))
    currency = result.scalar_one_or_none()
    if currency is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
    return currency


@currencies_router.get("", response_model=list[CurrencyOut])
async def list_currencies(db: AsyncSession = Depends(get_db)) -> list[CurrencyOut]:
    result = await db.execute(select(Currency).order_by(Currency.code))
    return [CurrencyOut.model_validate(c) for c in result.scalars().all()]


@currencies_router.post("", response_model=CurrencyOut, status_code=status.HTTP_201_CREATED)
async def create_currency(payload: CurrencyCreate, db: AsyncSession = Depends(get_db)) -> CurrencyOut:
    existing = await db.execute(select(Currency).where(Currency.code == payload.code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Currency code already exists"
        )
    currency = Currency(**payload.model_dump(exclude={"is_default"}))
    db.add(currency)

    if payload.is_default:
        await db.flush()
        await db.execute(update(Currency).values(is_default=False))
        currency.is_default = True

    await db.commit()
    await db.refresh(currency)
    return CurrencyOut.model_validate(currency)


@currencies_router.get("/{currency_id}", response_model=CurrencyOut)
async def get_currency(currency_id: str, db: AsyncSession = Depends(get_db)) -> CurrencyOut:
    currency = await _get_currency(db, currency_id)
    return CurrencyOut.model_validate(currency)


@currencies_router.patch("/{currency_id}", response_model=CurrencyOut)
async def update_currency(
    currency_id: str, payload: CurrencyUpdate, db: AsyncSession = Depends(get_db)
) -> CurrencyOut:
    currency = await _get_currency(db, currency_id)
    data = payload.model_dump(exclude_unset=True)
    is_default = data.pop("is_default", None)
    for field, value in data.items():
        setattr(currency, field, value)

    if is_default is True:
        await db.execute(update(Currency).values(is_default=False))
        currency.is_default = True
    elif is_default is False:
        currency.is_default = False

    await db.commit()
    await db.refresh(currency)
    return CurrencyOut.model_validate(currency)


@currencies_router.delete("/{currency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_currency(currency_id: str, db: AsyncSession = Depends(get_db)) -> None:
    currency = await _get_currency(db, currency_id)
    await db.delete(currency)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This currency is assigned to one or more users and can't be deleted. "
                "Deactivate it instead."
            ),
        )


async def _get_language(db: AsyncSession, language_id: str) -> Language:
    try:
        uid = UUID(language_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Language not found")
    result = await db.execute(select(Language).where(Language.id == uid))
    language = result.scalar_one_or_none()
    if language is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Language not found")
    return language


@languages_router.get("", response_model=list[LanguageOut])
async def list_languages(db: AsyncSession = Depends(get_db)) -> list[LanguageOut]:
    result = await db.execute(select(Language).order_by(Language.code))
    return [LanguageOut.model_validate(l) for l in result.scalars().all()]


@languages_router.post("", response_model=LanguageOut, status_code=status.HTTP_201_CREATED)
async def create_language(payload: LanguageCreate, db: AsyncSession = Depends(get_db)) -> LanguageOut:
    existing = await db.execute(select(Language).where(Language.code == payload.code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Language code already exists"
        )
    language = Language(**payload.model_dump())
    db.add(language)
    await db.commit()
    await db.refresh(language)
    return LanguageOut.model_validate(language)


@languages_router.get("/{language_id}", response_model=LanguageOut)
async def get_language(language_id: str, db: AsyncSession = Depends(get_db)) -> LanguageOut:
    language = await _get_language(db, language_id)
    return LanguageOut.model_validate(language)


@languages_router.patch("/{language_id}", response_model=LanguageOut)
async def update_language(
    language_id: str, payload: LanguageUpdate, db: AsyncSession = Depends(get_db)
) -> LanguageOut:
    language = await _get_language(db, language_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(language, field, value)
    await db.commit()
    await db.refresh(language)
    return LanguageOut.model_validate(language)


@languages_router.delete("/{language_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_language(language_id: str, db: AsyncSession = Depends(get_db)) -> None:
    language = await _get_language(db, language_id)
    await db.delete(language)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This language is assigned to one or more users and can't be deleted. "
                "Deactivate it instead."
            ),
        )


async def _get_country(db: AsyncSession, country_id: str) -> Country:
    try:
        uid = UUID(country_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    result = await db.execute(select(Country).where(Country.id == uid))
    country = result.scalar_one_or_none()
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    return country


@countries_router.get("", response_model=list[CountryOut])
async def list_countries(db: AsyncSession = Depends(get_db)) -> list[CountryOut]:
    result = await db.execute(select(Country).order_by(Country.name))
    return [CountryOut.model_validate(c) for c in result.scalars().all()]


@countries_router.post("", response_model=CountryOut, status_code=status.HTTP_201_CREATED)
async def create_country(payload: CountryCreate, db: AsyncSession = Depends(get_db)) -> CountryOut:
    existing = await db.execute(select(Country).where(Country.code == payload.code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Country code already exists"
        )
    country = Country(**payload.model_dump())
    db.add(country)
    await db.commit()
    await db.refresh(country)
    return CountryOut.model_validate(country)


@countries_router.get("/{country_id}", response_model=CountryOut)
async def get_country(country_id: str, db: AsyncSession = Depends(get_db)) -> CountryOut:
    country = await _get_country(db, country_id)
    return CountryOut.model_validate(country)


@countries_router.patch("/{country_id}", response_model=CountryOut)
async def update_country(
    country_id: str, payload: CountryUpdate, db: AsyncSession = Depends(get_db)
) -> CountryOut:
    country = await _get_country(db, country_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(country, field, value)
    await db.commit()
    await db.refresh(country)
    return CountryOut.model_validate(country)


@countries_router.delete("/{country_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_country(country_id: str, db: AsyncSession = Depends(get_db)) -> None:
    country = await _get_country(db, country_id)
    await db.delete(country)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "This country is assigned to one or more currencies and can't be deleted. "
                "Deactivate it instead."
            ),
        )

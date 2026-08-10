from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.reference import Country, Currency, Language
from app.schemas.reference import CountryOut, CurrencyOut, LanguageOut

router = APIRouter()


@router.get("/currencies", response_model=list[CurrencyOut])
async def list_currencies(db: AsyncSession = Depends(get_db)) -> list[CurrencyOut]:
    result = await db.execute(
        select(Currency)
        .where(Currency.is_active.is_(True))
        .order_by(Currency.code)
    )
    return [CurrencyOut.model_validate(c) for c in result.scalars().all()]


@router.get("/languages", response_model=list[LanguageOut])
async def list_languages(db: AsyncSession = Depends(get_db)) -> list[LanguageOut]:
    result = await db.execute(
        select(Language)
        .where(Language.is_active.is_(True))
        .order_by(Language.code)
    )
    return [LanguageOut.model_validate(l) for l in result.scalars().all()]


@router.get("/countries", response_model=list[CountryOut])
async def list_countries(db: AsyncSession = Depends(get_db)) -> list[CountryOut]:
    result = await db.execute(
        select(Country)
        .where(Country.is_active.is_(True))
        .order_by(Country.name)
    )
    return [CountryOut.model_validate(c) for c in result.scalars().all()]

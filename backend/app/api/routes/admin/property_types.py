"""Admin Property Types — `/api/v1/admin/stays/property-types/*`.

Gated by the existing "stays" RBAC module (registered in 017) — lives under
the same Stays nav section as Stays Config, not a new permission module.
Image upload mirrors `admin/theme.py::upload_logo` exactly (same allow-list,
size cap, and `/static/uploads/` storage) — it's its own action, not a
field on the create/update JSON body.
"""

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.db.session import get_db
from app.models.property_type import PropertyType
from app.schemas.property_type import PropertyTypeCreate, PropertyTypeOut, PropertyTypeUpdate

router = APIRouter(dependencies=[Depends(require_admin)])

ALLOWED_IMAGE_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/svg+xml"}
MAX_IMAGE_BYTES = 2 * 1024 * 1024  # 2 MB
UPLOAD_DIR = Path("static") / "uploads"


async def _get_property_type(db: AsyncSession, property_type_id: str) -> PropertyType:
    try:
        uid = UUID(property_type_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property type not found")
    result = await db.execute(select(PropertyType).where(PropertyType.id == uid))
    property_type = result.scalar_one_or_none()
    if property_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property type not found")
    return property_type


@router.get("", response_model=list[PropertyTypeOut])
async def list_property_types(db: AsyncSession = Depends(get_db)) -> list[PropertyTypeOut]:
    result = await db.execute(select(PropertyType).order_by(PropertyType.sort_order))
    return [PropertyTypeOut.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=PropertyTypeOut, status_code=status.HTTP_201_CREATED)
async def create_property_type(
    payload: PropertyTypeCreate, db: AsyncSession = Depends(get_db)
) -> PropertyTypeOut:
    existing = await db.execute(select(PropertyType).where(PropertyType.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Slug already exists"
        )
    property_type = PropertyType(**payload.model_dump())
    db.add(property_type)
    await db.commit()
    await db.refresh(property_type)
    return PropertyTypeOut.model_validate(property_type)


@router.get("/{property_type_id}", response_model=PropertyTypeOut)
async def get_property_type(
    property_type_id: str, db: AsyncSession = Depends(get_db)
) -> PropertyTypeOut:
    property_type = await _get_property_type(db, property_type_id)
    return PropertyTypeOut.model_validate(property_type)


@router.patch("/{property_type_id}", response_model=PropertyTypeOut)
async def update_property_type(
    property_type_id: str, payload: PropertyTypeUpdate, db: AsyncSession = Depends(get_db)
) -> PropertyTypeOut:
    property_type = await _get_property_type(db, property_type_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(property_type, field, value)
    await db.commit()
    await db.refresh(property_type)
    return PropertyTypeOut.model_validate(property_type)


@router.delete("/{property_type_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property_type(property_type_id: str, db: AsyncSession = Depends(get_db)) -> None:
    property_type = await _get_property_type(db, property_type_id)
    await db.delete(property_type)
    await db.commit()


@router.post("/{property_type_id}/image", response_model=PropertyTypeOut)
async def upload_property_type_image(
    property_type_id: str,
    db: AsyncSession = Depends(get_db),
    file: UploadFile = File(...),
) -> PropertyTypeOut:
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be a PNG, JPEG, WEBP or SVG image.",
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be smaller than 2 MB.",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "").suffix
    filename = f"{uuid4()}{suffix}"
    (UPLOAD_DIR / filename).write_bytes(contents)

    property_type = await _get_property_type(db, property_type_id)
    property_type.image_url = f"/static/uploads/{filename}"
    await db.commit()
    await db.refresh(property_type)
    return PropertyTypeOut.model_validate(property_type)

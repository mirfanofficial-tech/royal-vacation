from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from app.api.deps import require_admin
from app.db import memory
from app.models.user import User
from app.schemas.property import Property, PropertyCreate, PropertyUpdate

router = APIRouter()


@router.get("/properties", response_model=list[Property])
def list_properties() -> list[Property]:
    return memory.list_properties()


@router.get("/properties/{property_id}", response_model=Property)
def get_property(property_id: str) -> Property:
    property = memory.get_property(property_id)
    if property is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return property


@router.post("/properties", response_model=Property, status_code=status.HTTP_201_CREATED)
def create_property(
    payload: PropertyCreate,
    _admin: User = Depends(require_admin),
) -> Property:
    property = Property.model_validate(payload, update={"id": f"prp_{uuid4().hex[:12]}"})
    return memory.upsert_property(property)


@router.patch("/properties/{property_id}", response_model=Property)
def update_property(
    property_id: str,
    payload: PropertyUpdate,
    _admin: User = Depends(require_admin),
) -> Property:
    existing = memory.get_property(property_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    updated = existing.model_copy(update=payload.model_dump(exclude_unset=True))
    return memory.upsert_property(updated)


@router.delete("/properties/{property_id}", response_model=None)
def delete_property(
    property_id: str,
    _admin: User = Depends(require_admin),
) -> JSONResponse:
    if not memory.delete_property(property_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return JSONResponse({"ok": True})

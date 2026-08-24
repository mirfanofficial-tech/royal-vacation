"""Admin third-party module management — `/api/v1/admin/modules/*`.

Credentials are Fernet-encrypted at rest (app/core/crypto.py) and never
returned in full — reads only ever see a masked preview of fields marked
`secret` in `credential_schema`. There is deliberately no "reveal" endpoint;
to change a credential, set a new value (an omitted key on update keeps the
current value).

Create/delete (added for VERVOTECH_INTEGRATION.md Stage A — admin-driven
provider onboarding, mirroring app/api/routes/admin/payment_gateways.py's
create_gateway/delete_gateway). `api_config`/`field_mapping` drive
GenericRestSupplierClient (app/integrations/generic_rest.py); test-connection
runs a real call through it via app/integrations/registry.py.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.core.crypto import decrypt_json, encrypt_json
from app.db.session import get_db
from app.integrations.base import IntegrationError
from app.integrations.generic_rest import GenericRestSupplierClient
from app.integrations.registry import get_client
from app.models.module import ThirdPartyModule
from app.schemas.module import (
    ApiConfig,
    CredentialFieldOut,
    MarkupRule,
    TaxConfig,
    TestConnectionResult,
    ThirdPartyModuleCreate,
    ThirdPartyModuleOut,
    ThirdPartyModuleUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


def _mask(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 4:
        return "•" * len(value)
    return "•" * (len(value) - 4) + value[-4:]


def _to_out(module: ThirdPartyModule) -> ThirdPartyModuleOut:
    values = decrypt_json(module.credentials_encrypted)
    fields = [
        CredentialFieldOut(
            key=field["key"],
            label=field["label"],
            secret=field.get("secret", False),
            required=field.get("required", False),
            value=(
                _mask(values.get(field["key"]))
                if field.get("secret")
                else values.get(field["key"])
            ),
        )
        for field in module.credential_schema
    ]
    return ThirdPartyModuleOut(
        id=module.id,
        provider=module.provider,
        module_id=module.module_id,
        name=module.name,
        category=module.category,
        status=module.status,
        ai_enabled=module.ai_enabled,
        environment=module.environment,
        markup_b2b=MarkupRule(type=module.markup_b2b_type, value=module.markup_b2b_value),
        markup_b2c=MarkupRule(type=module.markup_b2c_type, value=module.markup_b2c_value),
        base_currency=module.base_currency,
        tax=TaxConfig(type=module.tax_type, value=module.tax_value),
        credential_fields=fields,
        help_text=module.help_text,
        api_config=ApiConfig(**module.api_config) if module.api_config else None,
        field_mapping=module.field_mapping or {},
        created_at=module.created_at,
        updated_at=module.updated_at,
    )


async def _get_module(db: AsyncSession, module_id: str) -> ThirdPartyModule:
    try:
        uid = UUID(module_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    result = await db.execute(select(ThirdPartyModule).where(ThirdPartyModule.id == uid))
    module = result.scalar_one_or_none()
    if module is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@router.get("", response_model=list[ThirdPartyModuleOut])
async def list_modules(db: AsyncSession = Depends(get_db)) -> list[ThirdPartyModuleOut]:
    result = await db.execute(select(ThirdPartyModule).order_by(ThirdPartyModule.name))
    return [_to_out(m) for m in result.scalars().all()]


@router.post("", response_model=ThirdPartyModuleOut, status_code=status.HTTP_201_CREATED)
async def create_module(
    payload: ThirdPartyModuleCreate, db: AsyncSession = Depends(get_db)
) -> ThirdPartyModuleOut:
    existing = await db.execute(
        select(ThirdPartyModule).where(ThirdPartyModule.provider == payload.provider)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Provider already exists"
        )

    module = ThirdPartyModule(
        provider=payload.provider,
        module_id=payload.module_id,
        name=payload.name,
        category=payload.category,
        status=payload.status,
        ai_enabled=payload.ai_enabled,
        environment=payload.environment,
        markup_b2b_type=payload.markup_b2b.type,
        markup_b2b_value=payload.markup_b2b.value,
        markup_b2c_type=payload.markup_b2c.type,
        markup_b2c_value=payload.markup_b2c.value,
        base_currency=payload.base_currency,
        tax_type=payload.tax.type,
        tax_value=payload.tax.value,
        credential_schema=payload.credential_schema,
        credentials_encrypted=encrypt_json(payload.credentials) if payload.credentials else None,
        help_text=payload.help_text,
        api_config=payload.api_config.model_dump() if payload.api_config else None,
        field_mapping=payload.field_mapping,
    )
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return _to_out(module)


@router.get("/{module_id}", response_model=ThirdPartyModuleOut)
async def get_module(module_id: str, db: AsyncSession = Depends(get_db)) -> ThirdPartyModuleOut:
    module = await _get_module(db, module_id)
    return _to_out(module)


@router.patch("/{module_id}", response_model=ThirdPartyModuleOut)
async def update_module(
    module_id: str, payload: ThirdPartyModuleUpdate, db: AsyncSession = Depends(get_db)
) -> ThirdPartyModuleOut:
    module = await _get_module(db, module_id)

    data = payload.model_dump(exclude_unset=True, exclude={"credentials", "markup_b2b", "markup_b2c", "tax"})
    for field, value in data.items():
        setattr(module, field, value)

    if payload.markup_b2b is not None:
        module.markup_b2b_type = payload.markup_b2b.type
        module.markup_b2b_value = payload.markup_b2b.value
    if payload.markup_b2c is not None:
        module.markup_b2c_type = payload.markup_b2c.type
        module.markup_b2c_value = payload.markup_b2c.value
    if payload.tax is not None:
        module.tax_type = payload.tax.type
        module.tax_value = payload.tax.value

    if payload.credentials is not None:
        current = decrypt_json(module.credentials_encrypted)
        current.update(payload.credentials)
        module.credentials_encrypted = encrypt_json(current)

    await db.commit()
    await db.refresh(module)
    return _to_out(module)


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(module_id: str, db: AsyncSession = Depends(get_db)) -> None:
    module = await _get_module(db, module_id)
    await db.delete(module)
    await db.commit()


# Sample search params for a test-connection call — Stage A has no real hotel
# context yet (that's Stage B/C), so this just proves the request/auth/field-
# mapping pipeline works end to end against whatever the admin configured.
_TEST_CONNECTION_SAMPLE_PARAMS = {
    "checkIn": "2026-09-01",
    "checkOut": "2026-09-03",
    "adults": "2",
}


@router.post("/{module_id}/test-connection", response_model=TestConnectionResult)
async def test_module_connection(
    module_id: str, db: AsyncSession = Depends(get_db)
) -> TestConnectionResult:
    module = await _get_module(db, module_id)
    if not module.api_config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add an API configuration before testing the connection",
        )

    try:
        client = await get_client(db, module.provider)
    except Exception as exc:  # ProviderNotConfiguredError or a lookup failure
        return TestConnectionResult(ok=False, message=str(exc))

    if not isinstance(client, GenericRestSupplierClient):
        return TestConnectionResult(
            ok=False,
            message=f"'{module.provider}' uses a bespoke client — test connection isn't wired up for it yet",
        )

    try:
        preview = await client.search(_TEST_CONNECTION_SAMPLE_PARAMS)
    except IntegrationError as exc:
        return TestConnectionResult(ok=False, message=str(exc))

    if module.field_mapping and not preview:
        return TestConnectionResult(
            ok=False,
            message="Connected, but no configured field mapping matched the response — check the JSONPath expressions",
            preview=preview,
        )

    return TestConnectionResult(
        ok=True, message=f"Connected to {module.name} and mapped {len(preview)} field(s)", preview=preview
    )

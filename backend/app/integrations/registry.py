"""`provider_slug -> client` resolution.

Generic-shaped providers (standard REST/JSON, configured entirely through
`api_config`/`field_mapping`) get `GenericRestSupplierClient`. A provider
with something the config can't express — custom auth handshake, XML/SOAP,
a multi-step booking flow — gets its own small subclass registered in
`PROVIDER_CLIENT_OVERRIDES` instead. Vervotech's actual mapping API is the
likely first bespoke case, but that client isn't built in Stage A — this is
just the scaffolding. See VERVOTECH_INTEGRATION.md Stage A step 10.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.providers import ProviderNotConfiguredError, get_provider_credentials
from app.integrations.base import BaseSupplierClient
from app.integrations.generic_rest import GenericRestSupplierClient
from app.models.module import ThirdPartyModule

# Empty for now — populate as a provider needs bespoke logic the generic
# REST client can't express, e.g. PROVIDER_CLIENT_OVERRIDES = {"vervotech": VervotechClient}.
PROVIDER_CLIENT_OVERRIDES: dict[str, type[BaseSupplierClient]] = {}


async def get_client(db: AsyncSession, provider_slug: str) -> BaseSupplierClient:
    result = await db.execute(
        select(ThirdPartyModule).where(ThirdPartyModule.provider == provider_slug)
    )
    module = result.scalar_one_or_none()
    if module is None:
        raise ProviderNotConfiguredError(f"No provider registered for '{provider_slug}'")

    credentials = await get_provider_credentials(db, provider_slug)

    client_class = PROVIDER_CLIENT_OVERRIDES.get(provider_slug, GenericRestSupplierClient)
    return client_class(module, credentials)

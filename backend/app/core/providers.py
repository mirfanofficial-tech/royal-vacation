"""Look up a third-party provider's decrypted credentials.

Every integration client goes through `get_provider_credentials()` instead
of touching `Settings` or `third_party_modules` directly — see
VERVOTECH_INTEGRATION.md Stage A step 7.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.crypto import decrypt_json
from app.models.module import ThirdPartyModule


class ProviderNotConfiguredError(Exception):
    """Raised when a provider row doesn't exist or has no usable credentials.

    `decrypt_json` fails soft (returns `{}` on a missing/corrupt token) since
    that's the right behavior for the admin UI (show an empty form rather
    than 500). An integration client can't do anything useful with an empty
    credentials dict, though, so this surfaces the gap explicitly instead of
    letting a client silently attempt an unauthenticated call.
    """


async def get_provider_credentials(db: AsyncSession, slug: str) -> dict[str, str]:
    result = await db.execute(select(ThirdPartyModule).where(ThirdPartyModule.provider == slug))
    module = result.scalar_one_or_none()
    if module is None:
        raise ProviderNotConfiguredError(f"No provider registered for '{slug}'")

    credentials = decrypt_json(module.credentials_encrypted)
    if not credentials:
        raise ProviderNotConfiguredError(f"Provider '{slug}' has no credentials configured")
    return credentials

"""Shared plumbing every supplier client needs.

Follows the httpx convention already established in `app/api/routes/auth.py`
(Google/Facebook sign-in): a short-lived `httpx.AsyncClient` per call, an
explicit timeout, `httpx.HTTPError` translated into a clean domain error
rather than propagated raw. The retry loop below has no existing precedent
to mirror — it's new for this integration layer, kept deliberately minimal.
See VERVOTECH_INTEGRATION.md Stage A step 8.
"""

import asyncio
import logging

import httpx

from app.models.module import ThirdPartyModule

logger = logging.getLogger(__name__)

_TIMEOUT_SECONDS = 10.0
_MAX_ATTEMPTS = 2
_RETRY_DELAY_SECONDS = 0.5


class IntegrationError(Exception):
    """A provider call failed after retries, or the provider returned an
    error response. Callers (route handlers) translate this into a clean
    HTTP error rather than letting an httpx exception leak out."""


class BaseSupplierClient:
    """Base class for provider clients. Subclasses (or the generic REST
    client) implement `search`/`rates`/`book`; this only owns the
    credentialed HTTP plumbing shared by all of them."""

    def __init__(self, module: ThirdPartyModule, credentials: dict[str, str]) -> None:
        self.module = module
        self.provider_slug = module.provider
        self.credentials = credentials

    async def _request(
        self,
        method: str,
        url: str,
        *,
        headers: dict[str, str] | None = None,
        params: dict[str, str] | None = None,
        json: dict | None = None,
        auth: tuple[str, str] | None = None,
    ) -> httpx.Response:
        last_error: Exception | None = None
        for attempt in range(1, _MAX_ATTEMPTS + 1):
            try:
                async with httpx.AsyncClient(timeout=_TIMEOUT_SECONDS) as client:
                    response = await client.request(
                        method, url, headers=headers, params=params, json=json, auth=auth
                    )
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as exc:
                # A real error response (4xx/5xx) — retrying won't fix a bad
                # request or bad credentials, so fail immediately.
                raise IntegrationError(
                    f"{self.provider_slug}: {exc.response.status_code} calling {url}"
                ) from exc
            except httpx.HTTPError as exc:
                last_error = exc
                logger.warning(
                    "%s: attempt %d/%d failed calling %s: %s",
                    self.provider_slug,
                    attempt,
                    _MAX_ATTEMPTS,
                    url,
                    exc,
                )
                if attempt < _MAX_ATTEMPTS:
                    await asyncio.sleep(_RETRY_DELAY_SECONDS)

        raise IntegrationError(
            f"{self.provider_slug}: couldn't reach {url} after {_MAX_ATTEMPTS} attempts"
        ) from last_error

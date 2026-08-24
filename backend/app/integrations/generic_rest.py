"""Config-driven REST/JSON supplier client.

Reads a provider's `api_config` (base URL, auth, endpoint paths) and
`field_mapping` (canonical field -> JSONPath) and does the rest generically:
authenticated request -> call named endpoint -> walk the JSON response ->
canonical fields. Most of the 3 suppliers should use this directly if
they're standard REST/JSON; anything with a real quirk (custom auth
handshake, XML/SOAP, multi-step booking) gets its own subclass instead — see
`app/integrations/registry.py`. VERVOTECH_INTEGRATION.md Stage A step 9.

`api_config` shape:
    {
      "base_url": str,
      "auth_type": "bearer" | "api_key" | "basic",
      "auth_credential_key": str,   # which credentials[key] holds the token/api key (bearer/api_key)
      "auth_header": str,           # header name for api_key auth, default "X-API-Key"
      "auth_username_key": str,     # credentials[key] for basic auth username
      "auth_password_key": str,     # credentials[key] for basic auth password
      "endpoints": {
        "search": {"method": "GET", "path": "/hotels/search"},
        "rates": {"method": "GET", "path": "/hotels/rates"},
        "booking": {"method": "POST", "path": "/bookings"}
      }
    }
"""

from typing import Any

from jsonpath_ng import parse as jsonpath_parse

from app.integrations.base import BaseSupplierClient, IntegrationError


class GenericRestSupplierClient(BaseSupplierClient):
    def _endpoint(self, name: str) -> dict[str, str]:
        endpoints = (self.module.api_config or {}).get("endpoints", {})
        endpoint = endpoints.get(name)
        if not endpoint:
            raise IntegrationError(f"{self.provider_slug}: no '{name}' endpoint configured")
        return endpoint

    def _auth_kwargs(self) -> dict[str, Any]:
        config = self.module.api_config or {}
        auth_type = config.get("auth_type")

        if auth_type == "bearer":
            key = config.get("auth_credential_key", "bearer_token")
            token = self.credentials.get(key)
            if not token:
                raise IntegrationError(
                    f"{self.provider_slug}: credential '{key}' not set for bearer auth"
                )
            return {"headers": {"Authorization": f"Bearer {token}"}}

        if auth_type == "api_key":
            key = config.get("auth_credential_key", "api_key")
            value = self.credentials.get(key)
            if not value:
                raise IntegrationError(
                    f"{self.provider_slug}: credential '{key}' not set for api_key auth"
                )
            header = config.get("auth_header", "X-API-Key")
            return {"headers": {header: value}}

        if auth_type == "basic":
            username_key = config.get("auth_username_key", "username")
            password_key = config.get("auth_password_key", "password")
            username = self.credentials.get(username_key)
            password = self.credentials.get(password_key)
            if not username or not password:
                raise IntegrationError(
                    f"{self.provider_slug}: username/password not set for basic auth"
                )
            return {"auth": (username, password)}

        raise IntegrationError(f"{self.provider_slug}: unsupported auth_type '{auth_type}'")

    async def call(self, endpoint_name: str, params: dict[str, str] | None = None) -> dict:
        """Call a named endpoint (search/rates/booking) and return the raw JSON body."""
        config = self.module.api_config or {}
        base_url = config.get("base_url")
        if not base_url:
            raise IntegrationError(f"{self.provider_slug}: no base_url configured")

        endpoint = self._endpoint(endpoint_name)
        url = base_url.rstrip("/") + endpoint["path"]
        method = endpoint.get("method", "GET")

        response = await self._request(method, url, params=params, **self._auth_kwargs())
        return response.json()

    def map_fields(self, raw: dict) -> dict[str, Any]:
        """Walk `raw` per `field_mapping`, returning {canonical_field: value}."""
        mapping = self.module.field_mapping or {}
        result: dict[str, Any] = {}
        for canonical_field, path in mapping.items():
            matches = jsonpath_parse(path).find(raw)
            if matches:
                result[canonical_field] = matches[0].value
        return result

    async def search(self, params: dict[str, str] | None = None) -> dict[str, Any]:
        raw = await self.call("search", params)
        return self.map_fields(raw)

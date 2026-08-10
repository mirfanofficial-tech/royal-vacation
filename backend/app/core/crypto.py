"""At-rest encryption for sensitive JSON blobs (payment gateway credentials).

Deliberately its own module rather than folded into `core/security.py` —
that file signs/verifies JWTs (integrity + expiry, not secrecy); this one
encrypts data that must stay confidential at rest. Different key, different
threat model, kept separate on purpose.
"""

import json
from typing import Any

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings

_fernet = Fernet(settings.payment_credentials_encryption_key.encode())


def encrypt_json(data: dict[str, Any]) -> str:
    return _fernet.encrypt(json.dumps(data).encode()).decode()


def decrypt_json(token: str | None) -> dict[str, Any]:
    if not token:
        return {}
    try:
        return json.loads(_fernet.decrypt(token.encode()).decode())
    except (InvalidToken, ValueError):
        return {}

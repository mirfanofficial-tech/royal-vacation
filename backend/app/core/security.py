import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, role: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    payload: dict[str, Any] = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


def generate_opaque_token(n_bytes: int = 48) -> str:
    """Random, non-JWT token used for refresh tokens stored in `user_sessions`."""
    return secrets.token_urlsafe(n_bytes)


def create_purpose_token(subject: str, purpose: str, expires_minutes: int) -> str:
    """Short-lived, single-purpose JWT for email verification / password reset.

    Stateless by design (no DB record) so it needs no new table; the `purpose`
    claim keeps it from being replayed as a different kind of token, and the
    short `exp` bounds the damage if it leaks.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "purpose": purpose, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_purpose_token(token: str, expected_purpose: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
    if payload.get("purpose") != expected_purpose:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None

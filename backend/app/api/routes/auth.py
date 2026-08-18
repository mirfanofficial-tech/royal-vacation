"""Authentication module — `/api/v1/auth/*`.

Public account lifecycle: register, login, logout, token refresh, email
verification, and password reset. Everything here is DB-backed against the
`users` / `user_sessions` / `user_login_history` tables; see app/api/deps.py
for the bearer-token identity check used by the other modules.
"""

from datetime import datetime, timedelta, timezone
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.api.routes.common import load_user_with_roles, to_user_out
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_purpose_token,
    decode_purpose_token,
    generate_opaque_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User, UserLoginHistory, UserSession
from app.schemas.auth import (
    AuthResponse,
    ConfirmResetRequest,
    FacebookAuthRequest,
    GoogleAuthRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    PasswordResetRequest,
    PasswordResetRequestOut,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPair,
    VerifyEmailRequest,
)
from app.schemas.user import UserOut

router = APIRouter()

_GENERIC_RESET_MESSAGE = (
    "If an account exists for that email, a password reset link has been sent."
)

_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
_FACEBOOK_GRAPH_ME_URL = "https://graph.facebook.com/me"


async def _issue_session(db: AsyncSession, user: User, request: Request | None) -> TokenPair:
    access_token = create_access_token(subject=str(user.id), role=user.account_type)
    refresh_token = generate_opaque_token()
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    db.add(
        UserSession(
            user_id=user.id,
            session_token=access_token,
            refresh_token=refresh_token,
            device_type="desktop",
            ip_address=request.client.host if request and request.client else None,
            expires_at=expires_at,
        )
    )
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


def _decode_purpose_uuid(token: str, purpose: str) -> UUID | None:
    subject = decode_purpose_token(token, purpose)
    if subject is None:
        return None
    try:
        return UUID(subject)
    except ValueError:
        return None


def _record_login(
    db: AsyncSession,
    *,
    email: str,
    user_id=None,
    status_: str,
    failure_reason: str | None = None,
    request: Request | None = None,
    login_type: str = "email",
) -> None:
    db.add(
        UserLoginHistory(
            user_id=user_id,
            email=email,
            login_type=login_type,
            ip_address=request.client.host if request and request.client else None,
            user_agent=request.headers.get("user-agent") if request else None,
            status=status_,
            failure_reason=failure_reason,
        )
    )


async def _find_or_create_social_user(
    db: AsyncSession,
    *,
    email: str,
    first_name: str | None,
    last_name: str | None,
    display_name: str | None,
    request: Request,
    login_type: str,
) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            password_hash=None,
            first_name=first_name,
            last_name=last_name,
            display_name=display_name or first_name or email,
            account_type="traveler",
            status="active",
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()  # populates user.id before it's referenced below
    elif user.deleted_at is not None or user.status in ("suspended", "deleted"):
        _record_login(
            db, email=email, user_id=user.id, status_="locked",
            failure_reason=f"account_{user.status}", request=request, login_type=login_type,
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This account is no longer active"
        )
    elif user.email_verified_at is None:
        # The provider already verified this email — no reason to keep the
        # account gated behind our own separate verification step.
        user.email_verified_at = datetime.now(timezone.utc)
        if user.status == "pending":
            user.status = "active"

    user.last_login_at = datetime.now(timezone.utc)
    return user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists"
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        display_name=payload.first_name,
        phone=payload.phone,
        account_type=payload.account_type,
        status="pending",
    )
    db.add(user)
    await db.flush()  # populates user.id (client-side default) before it's referenced below

    tokens = await _issue_session(db, user, request)
    _record_login(db, email=user.email, user_id=user.id, status_="success", request=request)
    await db.commit()

    verification_token = create_purpose_token(
        str(user.id),
        "email_verify",
        settings.email_verification_token_expire_minutes,
    )

    user = await load_user_with_roles(db, user.id)
    return AuthResponse(
        **tokens.model_dump(),
        user=to_user_out(user),
        verification_token=verification_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if (
        user is None
        or user.deleted_at is not None
        or user.password_hash is None
        or not verify_password(payload.password, user.password_hash)
    ):
        _record_login(
            db,
            email=payload.email,
            user_id=user.id if user else None,
            status_="failed",
            failure_reason="invalid_credentials",
            request=request,
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )

    if user.status in ("suspended", "deleted"):
        _record_login(
            db, email=payload.email, user_id=user.id, status_="locked",
            failure_reason=f"account_{user.status}", request=request,
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This account is no longer active"
        )

    user.last_login_at = datetime.now(timezone.utc)
    tokens = await _issue_session(db, user, request)
    _record_login(db, email=user.email, user_id=user.id, status_="success", request=request)
    await db.commit()

    user = await load_user_with_roles(db, user.id)
    return AuthResponse(**tokens.model_dump(), user=to_user_out(user))


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    payload: GoogleAuthRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                _GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {payload.access_token}"},
            )
        except httpx.HTTPError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Couldn't reach Google to verify sign-in. Please try again.",
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google sign-in token"
        )

    profile = response.json()
    email = profile.get("email")
    if not email or not profile.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your Google account has no verified email address",
        )

    user = await _find_or_create_social_user(
        db,
        email=email,
        first_name=profile.get("given_name"),
        last_name=profile.get("family_name"),
        display_name=profile.get("given_name") or profile.get("name"),
        request=request,
        login_type="google",
    )
    tokens = await _issue_session(db, user, request)
    _record_login(
        db, email=user.email, user_id=user.id, status_="success",
        request=request, login_type="google",
    )
    await db.commit()

    user = await load_user_with_roles(db, user.id)
    return AuthResponse(**tokens.model_dump(), user=to_user_out(user))


@router.post("/facebook", response_model=AuthResponse)
async def facebook_auth(
    payload: FacebookAuthRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> AuthResponse:
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                _FACEBOOK_GRAPH_ME_URL,
                params={
                    "fields": "id,first_name,last_name,name,email",
                    "access_token": payload.access_token,
                },
            )
        except httpx.HTTPError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Couldn't reach Facebook to verify sign-in. Please try again.",
            )

    profile = response.json()
    if response.status_code != 200 or "error" in profile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Facebook sign-in token"
        )

    # Unlike Google, Facebook's Graph API only returns `email` at all if the
    # user granted the email permission AND has a verified email on file —
    # it's simply absent otherwise, with no separate "unverified" state to
    # check for.
    email = profile.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Your Facebook account doesn't have an email address we can use. "
                "Please add one to your Facebook account or sign in another way."
            ),
        )

    user = await _find_or_create_social_user(
        db,
        email=email,
        first_name=profile.get("first_name"),
        last_name=profile.get("last_name"),
        display_name=profile.get("first_name") or profile.get("name"),
        request=request,
        login_type="facebook",
    )
    tokens = await _issue_session(db, user, request)
    _record_login(
        db, email=user.email, user_id=user.id, status_="success",
        request=request, login_type="facebook",
    )
    await db.commit()

    user = await load_user_with_roles(db, user.id)
    return AuthResponse(**tokens.model_dump(), user=to_user_out(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: LogoutRequest, db: AsyncSession = Depends(get_db)) -> None:
    await db.execute(
        update(UserSession)
        .where(
            UserSession.refresh_token == payload.refresh_token,
            UserSession.is_active.is_(True),
        )
        .values(is_active=False)
    )
    await db.commit()


@router.post("/refresh-token", response_model=TokenPair)
async def refresh_token(
    payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)
) -> TokenPair:
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token == payload.refresh_token,
            UserSession.is_active.is_(True),
        )
    )
    session = result.scalar_one_or_none()
    if session is None or session.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token"
        )

    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalar_one_or_none()
    if user is None or user.deleted_at is not None or user.status in ("suspended", "deleted"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Account no longer available"
        )

    new_access_token = create_access_token(subject=str(user.id), role=user.account_type)
    new_refresh_token = generate_opaque_token()
    session.session_token = new_access_token
    session.refresh_token = new_refresh_token
    session.last_activity_at = datetime.now(timezone.utc)
    session.expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    await db.commit()

    return TokenPair(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    user_id = _decode_purpose_uuid(payload.token, "email_verify")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token"
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")

    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(timezone.utc)
        if user.status == "pending":
            user.status = "active"
        await db.commit()

    return MessageResponse(message="Email verified successfully.")


@router.post("/reset-password", response_model=PasswordResetRequestOut)
async def reset_password(
    payload: PasswordResetRequest, db: AsyncSession = Depends(get_db)
) -> PasswordResetRequestOut:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or user.deleted_at is not None:
        return PasswordResetRequestOut(message=_GENERIC_RESET_MESSAGE)

    reset_token = create_purpose_token(
        str(user.id), "password_reset", settings.password_reset_token_expire_minutes
    )
    return PasswordResetRequestOut(message=_GENERIC_RESET_MESSAGE, reset_token=reset_token)


@router.post("/confirm-reset", response_model=MessageResponse)
async def confirm_reset(
    payload: ConfirmResetRequest, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    user_id = _decode_purpose_uuid(payload.token, "password_reset")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token"
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    user.password_hash = hash_password(payload.new_password)
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id, UserSession.is_active.is_(True))
        .values(is_active=False)
    )
    await db.commit()

    return MessageResponse(message="Password has been reset. Please log in again.")


@router.get("/me", response_model=UserOut)
async def me(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> UserOut:
    user = await load_user_with_roles(db, current_user.id)
    return to_user_out(user)

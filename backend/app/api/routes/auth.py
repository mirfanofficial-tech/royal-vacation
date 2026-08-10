from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.db import memory
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserPublic,
    register_to_user,
)

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = memory.get_user_by_email(payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(subject=user.id, role=user.role)
    return AuthResponse(access_token=token, user=UserPublic(**user.model_dump()))


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest) -> AuthResponse:
    if memory.get_user_by_email(payload.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = memory.create_user(register_to_user(payload, user_id=f"usr_{uuid4().hex[:12]}"))
    token = create_access_token(subject=user.id, role=user.role)
    return AuthResponse(access_token=token, user=UserPublic(**user.model_dump()))


@router.get("/me", response_model=UserPublic)
def me(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user

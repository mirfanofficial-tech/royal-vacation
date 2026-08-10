from pydantic import BaseModel, EmailStr, Field

from app.core.security import hash_password


class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    hashed_password: str
    role: str = "customer"


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1)


def register_to_user(payload: RegisterRequest, user_id: str) -> User:
    return User(
        id=user_id,
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )

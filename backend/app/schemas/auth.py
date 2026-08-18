from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    account_type: str = "traveler"

    @field_validator("account_type")
    @classmethod
    def validate_account_type(cls, v: str) -> str:
        if v not in ("traveler", "partner"):
            raise ValueError("account_type must be one of: traveler, partner")
        return v


class GoogleAuthRequest(BaseModel):
    # An OAuth2 access token from Google's implicit flow (obtained
    # client-side via @react-oauth/google's useGoogleLogin) — verified
    # server-side by calling Google's userinfo endpoint with it, not
    # trusted as-is.
    access_token: str


class FacebookAuthRequest(BaseModel):
    # An access token from the Facebook JS SDK's FB.login() — verified
    # server-side by calling the Graph API's /me endpoint with it, not
    # trusted as-is.
    access_token: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(TokenPair):
    user: UserOut
    # Dev-only convenience while there's no email delivery configured — lets the
    # verify-email flow be exercised end to end. Drop once emails are wired up.
    verification_token: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetRequestOut(BaseModel):
    message: str
    # Dev-only: with no email provider configured, the raw reset token is
    # returned directly so the flow is testable. In production this must be
    # emailed to the user instead of returned in the response.
    reset_token: str | None = None


class ConfirmResetRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str

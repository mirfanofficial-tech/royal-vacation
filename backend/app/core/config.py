from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Royal Vacation API"
    app_version: str = "0.1.0"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/royal_vacation"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

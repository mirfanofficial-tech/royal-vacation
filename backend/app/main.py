from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, profiles, properties, reference, roles, users
from app.core.config import settings
from app.db import memory


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings.api_v1_prefix
    app.include_router(health.router, prefix=prefix, tags=["health"])
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["auth"])
    app.include_router(properties.router, prefix=prefix, tags=["properties"])
    app.include_router(users.router, prefix=f"{prefix}/users", tags=["users"])
    app.include_router(roles.router, prefix=f"{prefix}/roles", tags=["roles"])
    app.include_router(reference.router, prefix=f"{prefix}/reference", tags=["reference"])
    app.include_router(profiles.router, prefix=f"{prefix}/profiles", tags=["profiles"])

    @app.on_event("startup")
    def on_startup() -> None:
        memory.seed_demo_data()

    return app


app = create_app()

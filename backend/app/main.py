from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import (
    auth,
    blog,
    cms,
    health,
    partner,
    profile,
    properties,
    property_types,
    reference,
    theme,
)
from app.api.routes import admin as admin_module
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
    # Authentication — public account lifecycle (register/login/logout/...).
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["auth"])
    # Admin management — user, partner and role administration.
    app.include_router(admin_module.router, prefix=f"{prefix}/admin", tags=["admin"])
    # Partner management — self-service for property-agent accounts.
    app.include_router(partner.router, prefix=f"{prefix}/partner", tags=["partner"])
    # User profile — self-service for any authenticated account.
    app.include_router(profile.router, prefix=f"{prefix}/profile", tags=["profile"])
    app.include_router(properties.router, prefix=prefix, tags=["properties"])
    app.include_router(reference.router, prefix=f"{prefix}/reference", tags=["reference"])
    app.include_router(theme.router, prefix=f"{prefix}/theme", tags=["theme"])
    app.include_router(
        property_types.router, prefix=f"{prefix}/property-types", tags=["property-types"]
    )
    app.include_router(blog.router, prefix=f"{prefix}/blog", tags=["blog"])
    app.include_router(cms.router, prefix=f"{prefix}/cms", tags=["cms"])

    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.on_event("startup")
    def on_startup() -> None:
        memory.seed_demo_data()

    return app


app = create_app()

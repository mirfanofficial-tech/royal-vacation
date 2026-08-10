"""Admin management module — `/api/v1/admin/*`.

Split by sub-resource since it's the largest module: user accounts, partner
verification, and RBAC roles/permissions each get their own file, all
combined into a single router mounted once in app/main.py.
"""

from fastapi import APIRouter

from app.api.routes.admin import (
    modules,
    partners,
    payment_gateways,
    profiles,
    reference,
    roles,
    users,
)

router = APIRouter()
router.include_router(users.router, prefix="/users", tags=["admin:users"])
router.include_router(partners.router, prefix="/partners", tags=["admin:partners"])
router.include_router(roles.router, prefix="/roles", tags=["admin:roles"])
router.include_router(profiles.router, prefix="/profiles", tags=["admin:profiles"])
router.include_router(
    reference.currencies_router, prefix="/reference/currencies", tags=["admin:reference"]
)
router.include_router(
    reference.languages_router, prefix="/reference/languages", tags=["admin:reference"]
)
router.include_router(
    reference.countries_router, prefix="/reference/countries", tags=["admin:reference"]
)
router.include_router(
    payment_gateways.router, prefix="/payment-gateways", tags=["admin:payment-gateways"]
)
router.include_router(modules.router, prefix="/modules", tags=["admin:modules"])

__all__ = ["router"]

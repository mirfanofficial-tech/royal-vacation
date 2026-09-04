"""Admin management module — `/api/v1/admin/*`.

Split by sub-resource since it's the largest module: user accounts, partner
verification, and RBAC roles/permissions each get their own file, all
combined into a single router mounted once in app/main.py.
"""

from fastapi import APIRouter

from app.api.routes.admin import (
    blog_categories,
    blog_comments,
    blog_posts,
    bookings,
    cms_blocks,
    cms_media,
    cms_menus,
    cms_pages,
    cms_translations,
    contact,
    genius,
    hotels,
    modules,
    partners,
    payment_gateways,
    profiles,
    promo_codes,
    property_types,
    reference,
    roles,
    stays,
    theme,
    users,
)

router = APIRouter()
router.include_router(users.router, prefix="/users", tags=["admin:users"])
router.include_router(bookings.router, prefix="/bookings", tags=["admin:bookings"])
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
router.include_router(hotels.router, prefix="/hotels", tags=["admin:hotels"])
router.include_router(theme.router, prefix="/theme", tags=["admin:theme"])
router.include_router(stays.router, prefix="/stays/settings", tags=["admin:stays"])
router.include_router(
    property_types.router, prefix="/stays/property-types", tags=["admin:property-types"]
)
router.include_router(blog_categories.router, prefix="/blog/categories", tags=["admin:blog"])
router.include_router(blog_posts.router, prefix="/blog/posts", tags=["admin:blog"])
router.include_router(blog_comments.router, prefix="/blog/comments", tags=["admin:blog"])
router.include_router(cms_pages.router, prefix="/cms/pages", tags=["admin:cms"])
router.include_router(cms_blocks.router, prefix="/cms/blocks", tags=["admin:cms"])
router.include_router(cms_menus.router, prefix="/cms/menus", tags=["admin:cms"])
router.include_router(cms_media.router, prefix="/cms/media", tags=["admin:cms"])
router.include_router(
    cms_translations.router, prefix="/cms/translations", tags=["admin:cms"]
)
router.include_router(contact.router, prefix="/contact", tags=["admin:contact"])
router.include_router(genius.router, prefix="/genius", tags=["admin:genius"])
router.include_router(
    promo_codes.router, prefix="/promo-codes", tags=["admin:promo-codes"]
)

__all__ = ["router"]

from app.core.security import hash_password
from app.schemas.auth import User
from app.schemas.property import Property

# ---------------------------------------------------------------------------
# In-memory stores.
# Placeholder until a real database is wired in. Replace with a PostgreSQL
# repository layer in packages/db when moving to production.
# ---------------------------------------------------------------------------

_USERS: dict[str, User] = {}
_PROPERTIES: dict[str, Property] = {}

_ADMIN_EMAIL = "admin@royalvacation.com"
_ADMIN_PASSWORD = "admin12345"


def seed_demo_data() -> None:
    if _USERS:
        return

    admin_id = "usr_admin_1"
    _USERS[admin_id] = User(
        id=admin_id,
        email=_ADMIN_EMAIL,
        name="Royal Vacation Admin",
        hashed_password=hash_password(_ADMIN_PASSWORD),
        role="admin",
    )

    seed_properties()


def seed_properties() -> None:
    sample: list[dict] = [
        {
            "id": "prp_001",
            "name": "Grand Marina Residence",
            "city": "Dubai",
            "country": "United Arab Emirates",
            "property_type": "Apartment",
            "price_per_night": 1450.0,
            "currency": "AED",
            "description": "Luxury waterfront apartment with panoramic marina views.",
            "address": "Dubai Marina, Dubai",
            "rating": 4.8,
            "amenities": ["Free WiFi", "Swimming pool", "Gym", "Concierge"],
        },
        {
            "id": "prp_002",
            "name": "The Palm Villa Retreat",
            "city": "Dubai",
            "country": "United Arab Emirates",
            "property_type": "Villa",
            "price_per_night": 4200.0,
            "currency": "AED",
            "description": "Private beachfront villa on Palm Jumeirah.",
            "address": "Palm Jumeirah, Dubai",
            "rating": 4.9,
            "amenities": ["Private pool", "Beach access", "Housekeeping", "Parking"],
        },
        {
            "id": "prp_003",
            "name": "Downtown Executive Suite",
            "city": "Dubai",
            "country": "United Arab Emirates",
            "property_type": "Hotel",
            "price_per_night": 980.0,
            "currency": "AED",
            "description": "Modern suite steps from Burj Khalifa.",
            "address": "Downtown Dubai",
            "rating": 4.6,
            "amenities": ["Free WiFi", "Restaurant", "Spa"],
        },
    ]
    for item in sample:
        _PROPERTIES[item["id"]] = Property.model_validate(item)


def get_admin_credentials() -> tuple[str, str]:
    return _ADMIN_EMAIL, _ADMIN_PASSWORD


def get_user_by_email(email: str) -> User | None:
    return next((u for u in _USERS.values() if u.email == email), None)


def get_user_by_id(user_id: str) -> User | None:
    return _USERS.get(user_id)


def create_user(user: User) -> User:
    _USERS[user.id] = user
    return user


def list_properties() -> list[Property]:
    return list(_PROPERTIES.values())


def get_property(property_id: str) -> Property | None:
    return _PROPERTIES.get(property_id)


def upsert_property(property: Property) -> Property:
    _PROPERTIES[property.id] = property
    return property


def delete_property(property_id: str) -> bool:
    return _PROPERTIES.pop(property_id, None) is not None

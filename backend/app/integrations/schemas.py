"""Canonical, supplier-agnostic shapes every integration client speaks.

Mirrors `client/src/lib/property-detail-mock-data.ts` (`PropertyDetail`,
`RoomOption`, `RatePlan`) field-for-field so Stage F is a data swap for the
frontend, not a component rewrite. Lives here rather than `app/schemas/`
because nothing serves these over HTTP yet — that's Stage C's `/rates`
endpoint. See VERVOTECH_INTEGRATION.md Stage A step 6.
"""

from pydantic import BaseModel


class RatePlan(BaseModel):
    id: str
    adults: int
    price: float
    original_price: float | None = None
    discount_percent: float | None = None
    taxes_fees: float
    loyalty_discount: bool | None = None
    perks: list[str] = []
    cancellation: str
    refundable: bool
    pay_note: str


class RoomOption(BaseModel):
    id: str
    name: str
    room_type: str  # "rooms" | "studios" | "apartments"
    image: str
    beds: str
    rooms_count: int
    max_guests: int
    size: str
    view: str
    tags: list[str] = []
    availability_note: str | None = None
    floor_note: str | None = None
    amenities: list[str] = []
    rate_plans: list[RatePlan] = []


class ReviewCategory(BaseModel):
    label: str
    score: float


class GuestReview(BaseModel):
    id: str
    name: str
    country: str
    country_code: str
    date: str
    score: float
    text: str
    photos: list[str] = []
    trip_info: str


class QuickFacility(BaseModel):
    icon: str
    label: str


class NearbyPlace(BaseModel):
    label: str
    distance: str


class GuestLovedQuote(BaseModel):
    text: str
    guest_name: str
    guest_country: str


class Hotel(BaseModel):
    id: str
    name: str
    badge: str | None = None
    star_rating: int
    rating: float
    rating_label: str
    reviews: int
    location: str
    lat: float
    lng: float
    distance: str
    country: str
    city: str
    price: float
    currency: str
    hero_image: str
    hero_badge: str
    gallery_images: list[str] = []
    extra_photos_count: int = 0
    about_short: str
    about_more: str
    quick_facilities: list[QuickFacility] = []
    popular_facilities: list[str] = []
    rooms: list[RoomOption] = []
    review_categories: list[ReviewCategory] = []
    guest_reviews: list[GuestReview] = []
    highlights: list[str] = []
    demand_note: str
    staff_score: float
    guest_loved_quote: GuestLovedQuote
    nearby: list[NearbyPlace] = []
    getting_around: list[NearbyPlace] = []

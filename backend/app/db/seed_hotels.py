"""Seed sample hotels into the Stage B pipeline tables (curated content +
supplier links) so the admin Hotel Mapping screen and the client's homepage
have real data to show.

This is explicitly sample/demo data, not a real Vervotech/supplier pull —
VERVOTECH_INTEGRATION.md's steps 12/13/15 are still blocked on real
credentials (see the doc's §7). It exists so "seed data and show it on the
client, dynamically" has something real to fetch from `hotels` instead of
staying at zero rows forever.

Run with:
    cd backend && ..\\.venv\\Scripts\\python.exe -m app.db.seed_hotels
"""

import asyncio
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

engine = create_async_engine(settings.database_url, pool_pre_ping=True)
Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

NOW = datetime.now(timezone.utc)


def _id() -> str:
    return str(uuid.uuid4())


HOTELS = [
    {
        "vervotech_id": "vt-sample-burj-al-arab",
        "name": "Burj Al Arab Jumeirah",
        "description": (
            "The iconic sail-shaped hotel on its own artificial island, one of "
            "the most recognizable luxury addresses in the world."
        ),
        "star_rating": 5,
        "address": "Jumeirah St, Umm Suqeim 3",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": "25.141300",
        "lng": "55.185500",
        "amenities": ["Private beach", "Rolls-Royce chauffeur", "Underwater restaurant", "Spa"],
        "hero_image": "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
        "suppliers": [("supplier-a", "SA-1001"), ("supplier-b", "SB-2001")],
    },
    {
        "vervotech_id": "vt-sample-atlantis-palm",
        "name": "Atlantis, The Palm",
        "description": (
            "A resort at the crest of Palm Jumeirah with a marine-life aquarium, "
            "waterpark and private beach."
        ),
        "star_rating": 5,
        "address": "Crescent Rd, The Palm Jumeirah",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": "25.130400",
        "lng": "55.117200",
        "amenities": ["Waterpark", "Aquarium", "Private beach", "Kids club"],
        "hero_image": "https://images.unsplash.com/photo-1634148551170-d37d021e0cc9?auto=format&fit=crop&w=800&q=80",
        "suppliers": [("supplier-a", "SA-1002"), ("supplier-c", "SC-3001")],
    },
    {
        "vervotech_id": "vt-sample-address-downtown",
        "name": "Address Downtown Dubai",
        "description": (
            "A modern high-rise hotel beside the Dubai Fountain with direct "
            "views of Burj Khalifa."
        ),
        "star_rating": 5,
        "address": "Emaar Blvd, Downtown Dubai",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": "25.194200",
        "lng": "55.274600",
        "amenities": ["Rooftop pool", "Skyline views", "Fountain views", "Spa"],
        "hero_image": "https://plus.unsplash.com/premium_photo-1733317416241-d92ba6af4e51?auto=format&fit=crop&w=800&q=80",
        "suppliers": [("supplier-b", "SB-2002")],
    },
    {
        "vervotech_id": "vt-sample-jumeirah-beach-resort",
        "name": "Jumeirah Beach Resort",
        "description": (
            "A wave-shaped beachfront resort with direct access to Wild Wadi "
            "Waterpark and views of Burj Al Arab."
        ),
        "star_rating": 5,
        "address": "Jumeirah Beach Rd",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": "25.138800",
        "lng": "55.191900",
        "amenities": ["Private beach", "Waterpark access", "Multiple pools", "Family rooms"],
        "hero_image": "https://images.unsplash.com/photo-1523816572-a1a23d1a67b8?auto=format&fit=crop&w=800&q=80",
        "suppliers": [("supplier-a", "SA-1003"), ("supplier-b", "SB-2003"), ("supplier-c", "SC-3002")],
    },
    {
        "vervotech_id": "vt-sample-palm-view-resort-spa",
        "name": "Palm View Resort & Spa",
        "description": (
            "A quiet resort built around an infinity pool overlooking the "
            "coastline, geared toward couples and long stays."
        ),
        "star_rating": 4,
        "address": "Palm Jumeirah Crescent",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "lat": "25.112100",
        "lng": "55.138900",
        "amenities": ["Infinity pool", "Spa", "Adults only", "Ocean view rooms"],
        "hero_image": "https://images.unsplash.com/photo-1543489822-c49534f3271f?auto=format&fit=crop&w=800&q=80",
        "suppliers": [("supplier-c", "SC-3003")],
    },
]


async def seed() -> None:
    async with Session() as session:
        for hotel in HOTELS:
            existing = await session.execute(
                text("SELECT id FROM hotels WHERE vervotech_id = :vervotech_id"),
                {"vervotech_id": hotel["vervotech_id"]},
            )
            row = existing.first()
            if row:
                hotel_id = str(row[0])
                print(f"  skip (exists): {hotel['name']}")
            else:
                hotel_id = _id()
                await session.execute(
                    text(
                        "INSERT INTO hotels "
                        "(id, vervotech_id, name, description, star_rating, address, city, "
                        "country, lat, lng, amenities, hero_image, gallery_images, "
                        "content_synced_at, created_at, updated_at) "
                        "VALUES (:id, :vervotech_id, :name, :description, :star_rating, :address, "
                        ":city, :country, :lat, :lng, CAST(:amenities AS jsonb), :hero_image, "
                        "CAST(:gallery_images AS jsonb), :now, :now, :now)"
                    ),
                    {
                        "id": hotel_id,
                        "vervotech_id": hotel["vervotech_id"],
                        "name": hotel["name"],
                        "description": hotel["description"],
                        "star_rating": hotel["star_rating"],
                        "address": hotel["address"],
                        "city": hotel["city"],
                        "country": hotel["country"],
                        "lat": hotel["lat"],
                        "lng": hotel["lng"],
                        "amenities": json.dumps(hotel["amenities"]),
                        "hero_image": hotel["hero_image"],
                        "gallery_images": json.dumps([hotel["hero_image"]]),
                        "now": NOW,
                    },
                )
                print(f"  seeded: {hotel['name']}")

            for supplier, supplier_hotel_id in hotel["suppliers"]:
                link_existing = await session.execute(
                    text(
                        "SELECT id FROM supplier_hotel_links "
                        "WHERE supplier = :supplier AND supplier_hotel_id = :supplier_hotel_id"
                    ),
                    {"supplier": supplier, "supplier_hotel_id": supplier_hotel_id},
                )
                if not link_existing.first():
                    await session.execute(
                        text(
                            "INSERT INTO supplier_hotel_links "
                            "(id, hotel_id, supplier, supplier_hotel_id, created_at) "
                            "VALUES (:id, :hotel_id, :supplier, :supplier_hotel_id, :now)"
                        ),
                        {
                            "id": _id(),
                            "hotel_id": hotel_id,
                            "supplier": supplier,
                            "supplier_hotel_id": supplier_hotel_id,
                            "now": NOW,
                        },
                    )

                raw_existing = await session.execute(
                    text(
                        "SELECT id FROM raw_supplier_hotels "
                        "WHERE supplier = :supplier AND supplier_hotel_id = :supplier_hotel_id"
                    ),
                    {"supplier": supplier, "supplier_hotel_id": supplier_hotel_id},
                )
                if not raw_existing.first():
                    payload = json.dumps(
                        {"name": hotel["name"], "supplier_hotel_id": supplier_hotel_id}
                    )
                    await session.execute(
                        text(
                            "INSERT INTO raw_supplier_hotels "
                            "(id, supplier, supplier_hotel_id, payload, created_at, updated_at) "
                            "VALUES (:id, :supplier, :supplier_hotel_id, CAST(:payload AS jsonb), :now, :now)"
                        ),
                        {
                            "id": _id(),
                            "supplier": supplier,
                            "supplier_hotel_id": supplier_hotel_id,
                            "payload": payload,
                            "now": NOW,
                        },
                    )

        await session.commit()
    print("done.")


if __name__ == "__main__":
    asyncio.run(seed())

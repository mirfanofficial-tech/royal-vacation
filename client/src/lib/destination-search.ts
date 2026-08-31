import type { HotelOut } from "@royal-vacation/api-client";

export type DestinationSuggestion =
  | { type: "city"; label: string; subtitle: string; hotelCount: number }
  | { type: "hotel"; label: string; subtitle: string; hotelId: string };

function rank(label: string, query: string): number {
  const l = label.toLowerCase();
  const q = query.toLowerCase();
  if (l === q) return 0;
  if (l.startsWith(q)) return 1;
  if (l.includes(q)) return 2;
  return -1;
}

/**
 * Groups real seeded `hotels` rows into city/country + hotel-name
 * suggestions, ranked by match quality. With no query, returns the cities
 * with the most hotels — booking.com-style "popular destinations" default.
 */
export function searchDestinations(
  hotels: HotelOut[],
  query: string,
  limit = 5
): DestinationSuggestion[] {
  const cityMap = new Map<string, { city: string; country: string; count: number }>();
  for (const hotel of hotels) {
    if (!hotel.city) continue;
    const key = `${hotel.city}|${hotel.country ?? ""}`;
    const existing = cityMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      cityMap.set(key, { city: hotel.city, country: hotel.country ?? "", count: 1 });
    }
  }

  const trimmed = query.trim();

  if (!trimmed) {
    return Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((c) => ({
        type: "city" as const,
        label: [c.city, c.country].filter(Boolean).join(", "),
        subtitle: `${c.count} ${c.count === 1 ? "property" : "properties"}`,
        hotelCount: c.count,
      }));
  }

  const cityMatches = Array.from(cityMap.values())
    .map((c) => {
      const cityScore = rank(c.city, trimmed);
      const fullScore = rank([c.city, c.country].join(", "), trimmed);
      const candidates = [cityScore, fullScore].filter((s) => s >= 0);
      return { c, score: candidates.length ? Math.min(...candidates) : -1 };
    })
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ c }) => ({
      type: "city" as const,
      label: [c.city, c.country].filter(Boolean).join(", "),
      subtitle: `${c.count} ${c.count === 1 ? "property" : "properties"}`,
      hotelCount: c.count,
    }));

  const hotelMatches = hotels
    .map((h) => ({ h, score: rank(h.name, trimmed) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ h }) => ({
      type: "hotel" as const,
      label: h.name,
      subtitle: [h.city, h.country].filter(Boolean).join(", "),
      hotelId: h.id,
    }));

  return [...cityMatches, ...hotelMatches];
}

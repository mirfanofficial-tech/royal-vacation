-- Royal Vacation — `property_types` (Stays > Property Types)
-- PostgreSQL 16+  |  depends on `001_users.sql` (set_updated_at trigger fn)
--
-- Admin-managed taxonomy backing the public homepage's "Browse by property
-- type" section. Gated by the existing "stays" RBAC module (017) — no new
-- permission module needed, this just lives under the same Stays nav
-- section as Stays Config. `slug` (not the UUID `id`) is what the client's
-- /search?propertyType=... links use, so it stays stable even though the
-- underlying id is now a real DB-generated UUID. `count_label` is a
-- manually-set display string, not a computed count — there's no real
-- property-listings table yet to compute one from.

CREATE TABLE property_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    count_label TEXT,
    image_url   TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_types_sort_order ON property_types (sort_order);

DROP TRIGGER IF EXISTS trg_property_types_updated_at ON property_types;
CREATE TRIGGER trg_property_types_updated_at
    BEFORE UPDATE ON property_types
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Seed the 6 types the homepage already shows, keeping their current
-- picsum image URLs so the feature looks correct immediately.
INSERT INTO property_types (name, slug, count_label, image_url, sort_order) VALUES
    ('Hotels',       'hotels',       '3,842 properties', 'https://picsum.photos/seed/royal-type-hotels/480/360',       1),
    ('Apartments',   'apartments',   '2,516 properties', 'https://picsum.photos/seed/royal-type-apartments/480/360',   2),
    ('Resorts',      'resorts',      '1,208 properties', 'https://picsum.photos/seed/royal-type-resorts/480/360',      3),
    ('Villas',       'villas',       '964 properties',   'https://picsum.photos/seed/royal-type-villas/480/360',       4),
    ('Guest houses', 'guesthouses',  '1,431 properties', 'https://picsum.photos/seed/royal-type-guesthouses/480/360',  5),
    ('Cabins',       'cabins',       '688 properties',   'https://picsum.photos/seed/royal-type-cabins/480/360',       6)
ON CONFLICT (slug) DO NOTHING;

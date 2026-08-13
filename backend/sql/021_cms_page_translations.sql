-- Royal Vacation — CMS extension: page_type/route_path on `cms_pages`,
-- `cms_page_translations`, and 3 seeded `system` pages for site-wide SEO.
-- PostgreSQL 16+  |  depends on `020_cms.sql`, `011_reference_data.sql` (languages)
--
-- `page_type='system'` records don't own real content — they're SEO-only
-- attachments to an existing bespoke client route (route_path), read via the
-- public `GET /cms/pages/by-route` endpoint. `page_type='content'` records
-- are unchanged from 020_cms.sql and still render at `/pages/{slug}`.
--
-- `cms_page_translations` mirrors `blog_post_translations` structurally, but
-- since page SEO is translatable too (not just body content), it carries the
-- SEO fields alongside title/excerpt/content.

ALTER TABLE cms_pages
    ADD COLUMN page_type TEXT NOT NULL DEFAULT 'content',
    ADD COLUMN route_path TEXT,
    ADD CONSTRAINT cms_pages_page_type_check CHECK (page_type IN ('content','system'));

CREATE UNIQUE INDEX idx_cms_pages_route_path ON cms_pages (route_path) WHERE route_path IS NOT NULL;

-- ---------------------------------------------------------------------------
-- cms_page_translations
-- ---------------------------------------------------------------------------

CREATE TABLE cms_page_translations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cms_page_id      UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
    language_code    TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    title            TEXT NOT NULL DEFAULT '',
    excerpt          TEXT NOT NULL DEFAULT '',
    content          TEXT NOT NULL DEFAULT '',
    meta_title       TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_page_translations_unique UNIQUE (cms_page_id, language_code)
);

CREATE INDEX idx_cms_page_translations_page_id ON cms_page_translations (cms_page_id);

DROP TRIGGER IF EXISTS trg_cms_page_translations_updated_at ON cms_page_translations;
CREATE TRIGGER trg_cms_page_translations_updated_at
    BEFORE UPDATE ON cms_page_translations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed the 3 system pages the client app reads by route_path. Slugs are
-- namespaced (`system-*`) so they can never collide with a real content
-- page's user-chosen slug.
-- ---------------------------------------------------------------------------

INSERT INTO cms_pages (title, slug, page_type, route_path, status, published_at, meta_title, meta_description, author_name)
VALUES
    ('Homepage SEO', 'system-home', 'system', '/', 'published', now(),
     'Royal Vacation | Find Your Perfect Stay',
     'Search hotels, apartments, resorts, villas and more with Royal Vacation. No booking fees, best price guarantee.',
     'Royal Vacation Admin'),
    ('Search Page SEO', 'system-search', 'system', '/search', 'published', now(),
     'Search Stays | Royal Vacation',
     'Browse hotels, apartments, resorts and villas across every destination on Royal Vacation.',
     'Royal Vacation Admin'),
    ('Property Detail SEO', 'system-property', 'system', '/property', 'published', now(),
     'Property Details | Royal Vacation',
     'View photos, amenities, pricing and availability for this Royal Vacation property.',
     'Royal Vacation Admin');

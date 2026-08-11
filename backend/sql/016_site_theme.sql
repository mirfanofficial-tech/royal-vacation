-- Royal Vacation — `site_theme` (singleton admin settings)
-- PostgreSQL 16+  |  depends on `001_users.sql` (set_updated_at trigger fn)
--
-- Controls the public website's header/footer variant, font family/sizes
-- and logo. Exactly one row exists (seeded below) — read via a public
-- GET /api/v1/theme, mutated only via the admin-gated PATCH/logo-upload
-- routes. `header_variant`/`footer_variant`/`font_family` are fixed,
-- code-defined sets (new options require a deploy, same as adding a font),
-- so plain CHECK-constrained TEXT columns rather than lookup tables.

CREATE TABLE site_theme (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    header_variant      TEXT NOT NULL DEFAULT 'default',
    footer_variant      TEXT NOT NULL DEFAULT 'classic',
    heading_font_size   TEXT NOT NULL DEFAULT 'md',
    paragraph_font_size TEXT NOT NULL DEFAULT 'md',
    font_family         TEXT NOT NULL DEFAULT 'outfit',
    logo_url            TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- 'default' is the header actually live on the client site today;
    -- 'classic'/'variant_2'..'variant_5' are the 5 alternate designs.
    CONSTRAINT site_theme_header_variant_check
        CHECK (header_variant IN ('default', 'classic', 'variant_2', 'variant_3', 'variant_4', 'variant_5')),
    CONSTRAINT site_theme_footer_variant_check
        CHECK (footer_variant IN ('classic', 'variant_2', 'variant_3', 'variant_4', 'variant_5')),
    CONSTRAINT site_theme_heading_font_size_check
        CHECK (heading_font_size IN ('sm', 'md', 'lg', 'xl')),
    CONSTRAINT site_theme_paragraph_font_size_check
        CHECK (paragraph_font_size IN ('sm', 'md', 'lg', 'xl')),
    CONSTRAINT site_theme_font_family_check
        CHECK (font_family IN ('outfit', 'inter', 'poppins', 'playfair_display', 'roboto'))
);

DROP TRIGGER IF EXISTS trg_site_theme_updated_at ON site_theme;
CREATE TRIGGER trg_site_theme_updated_at
    BEFORE UPDATE ON site_theme
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Exactly one row, all defaults. INSERT is idempotent (no-op if a row
-- already exists) via the WHERE NOT EXISTS guard.
INSERT INTO site_theme (header_variant, footer_variant, heading_font_size, paragraph_font_size, font_family)
SELECT 'default', 'classic', 'md', 'md', 'outfit'
WHERE NOT EXISTS (SELECT 1 FROM site_theme);

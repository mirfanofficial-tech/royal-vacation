-- Royal Vacation — CMS: `cms_media_folders`, `cms_media_assets`,
-- `cms_media_asset_translations`
-- PostgreSQL 16+  |  depends on `020_cms.sql`, `011_reference_data.sql` (languages)
--
-- Backs the Media Library admin screen, which was built earlier this
-- session against local mock data with no real backend. Folders are flat
-- (no nesting), matching the mock and the Menus/Categories precedent set
-- elsewhere this session. `alt_text` on the asset row is the base (English)
-- language value; `cms_media_asset_translations` mirrors `cms_page_translations`
-- for every other language. `used_in_count` is deliberately not stored here —
-- it's computed at read time by the API by scanning cms_pages/blog_posts/
-- cms_blocks content for the asset's file_url.

-- ---------------------------------------------------------------------------
-- cms_media_folders
-- ---------------------------------------------------------------------------

CREATE TABLE cms_media_folders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_cms_media_folders_updated_at ON cms_media_folders;
CREATE TRIGGER trg_cms_media_folders_updated_at
    BEFORE UPDATE ON cms_media_folders
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- cms_media_assets
-- ---------------------------------------------------------------------------

CREATE TABLE cms_media_assets (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename      TEXT NOT NULL,
    file_url      TEXT NOT NULL,
    asset_type    TEXT NOT NULL,
    folder_id     UUID REFERENCES cms_media_folders(id) ON DELETE SET NULL,
    width         INT,
    height        INT,
    size_bytes    BIGINT NOT NULL,
    format        TEXT NOT NULL,
    alt_text      TEXT NOT NULL DEFAULT '',
    tags          TEXT[] NOT NULL DEFAULT '{}',
    uploaded_by   TEXT NOT NULL DEFAULT 'Royal Vacation Admin',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_media_assets_type_check CHECK (asset_type IN ('image','document','video','vector'))
);

CREATE INDEX idx_cms_media_assets_folder_id ON cms_media_assets (folder_id);
CREATE INDEX idx_cms_media_assets_type ON cms_media_assets (asset_type);

DROP TRIGGER IF EXISTS trg_cms_media_assets_updated_at ON cms_media_assets;
CREATE TRIGGER trg_cms_media_assets_updated_at
    BEFORE UPDATE ON cms_media_assets
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- cms_media_asset_translations
-- ---------------------------------------------------------------------------

CREATE TABLE cms_media_asset_translations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id   UUID NOT NULL REFERENCES cms_media_assets(id) ON DELETE CASCADE,
    language_code    TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    alt_text         TEXT NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_media_asset_translations_unique UNIQUE (media_asset_id, language_code)
);

CREATE INDEX idx_cms_media_asset_translations_asset_id ON cms_media_asset_translations (media_asset_id);

DROP TRIGGER IF EXISTS trg_cms_media_asset_translations_updated_at ON cms_media_asset_translations;
CREATE TRIGGER trg_cms_media_asset_translations_updated_at
    BEFORE UPDATE ON cms_media_asset_translations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

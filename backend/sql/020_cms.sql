-- Royal Vacation — CMS: `cms_pages`, `cms_blocks`, `cms_menus`, `cms_menu_items`
-- PostgreSQL 16+  |  depends on `002_roles.sql`, `003_role_permissions.sql`,
-- `004_permissions.sql`
--
-- "cms" is already a fully-registered RBAC module (see 003/004, including
-- content_editor's existing full-CRUD grant) — no ALTER CHECK CONSTRAINT /
-- permission-catalog work needed here. This migration is pure DDL: 4 new
-- tables, no RBAC changes.
--
-- No translations child table (unlike blog_posts) — not requested for CMS
-- content in this pass. `cms_pages.parent_id` is a plain nullable self-FK
-- with no ORM-level children relationship, mirroring blog_comments'
-- parent_comment_id precedent — ON DELETE SET NULL rather than CASCADE so
-- deleting a parent page doesn't silently wipe out its whole subtree.

-- ---------------------------------------------------------------------------
-- cms_pages
-- ---------------------------------------------------------------------------

CREATE TABLE cms_pages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    excerpt           TEXT,
    content           TEXT NOT NULL DEFAULT '',
    featured_image_url TEXT,
    parent_id         UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
    sort_order        INT NOT NULL DEFAULT 0,
    status            TEXT NOT NULL DEFAULT 'draft',
    is_homepage       BOOLEAN NOT NULL DEFAULT false,
    meta_title        TEXT,
    meta_description  TEXT,
    author_name       TEXT NOT NULL DEFAULT 'Royal Vacation Admin',
    view_count        INTEGER NOT NULL DEFAULT 0,
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_pages_status_check CHECK (status IN ('draft','published','archived'))
);

CREATE INDEX idx_cms_pages_parent_id ON cms_pages (parent_id);
CREATE INDEX idx_cms_pages_status ON cms_pages (status);

DROP TRIGGER IF EXISTS trg_cms_pages_updated_at ON cms_pages;
CREATE TRIGGER trg_cms_pages_updated_at
    BEFORE UPDATE ON cms_pages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- cms_blocks — reusable named content snippets
-- ---------------------------------------------------------------------------

CREATE TABLE cms_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    content     TEXT NOT NULL DEFAULT '',
    block_type  TEXT NOT NULL DEFAULT 'text',
    location    TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cms_blocks_location ON cms_blocks (location);

DROP TRIGGER IF EXISTS trg_cms_blocks_updated_at ON cms_blocks;
CREATE TRIGGER trg_cms_blocks_updated_at
    BEFORE UPDATE ON cms_blocks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- cms_menus / cms_menu_items — flat, reorderable via sort_order (matches
-- the existing admin UI's up/down-arrow reordering, no drag-and-drop lib)
-- ---------------------------------------------------------------------------

CREATE TABLE cms_menus (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    location    TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_cms_menus_updated_at ON cms_menus;
CREATE TRIGGER trg_cms_menus_updated_at
    BEFORE UPDATE ON cms_menus
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TABLE cms_menu_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_id     UUID NOT NULL REFERENCES cms_menus(id) ON DELETE CASCADE,
    page_id     UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
    label       TEXT NOT NULL,
    url         TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cms_menu_items_menu_id ON cms_menu_items (menu_id);

DROP TRIGGER IF EXISTS trg_cms_menu_items_updated_at ON cms_menu_items;
CREATE TRIGGER trg_cms_menu_items_updated_at
    BEFORE UPDATE ON cms_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Royal Vacation — Blog: `blog_categories`, `blog_posts`,
-- `blog_post_translations`, `blog_comments`
-- PostgreSQL 16+  |  depends on `002_roles.sql`, `003_role_permissions.sql`,
-- `004_permissions.sql`, `011_reference_data.sql` (languages)
--
-- "blog" is already a fully-registered RBAC module (see 003/004) — no
-- ALTER CHECK CONSTRAINT / permission-catalog work needed here. All 9
-- languages the translations UI needs (vi/pl/it/de/tr/fr/es/zh-CN/ar) are
-- already seeded active rows in `languages` — no seeding needed either.
-- This migration is pure DDL: 4 new tables, no RBAC/reference-data changes.

-- ---------------------------------------------------------------------------
-- blog_categories
-- ---------------------------------------------------------------------------

CREATE TABLE blog_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    color       TEXT NOT NULL DEFAULT 'navy',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT blog_categories_color_check CHECK (
        color IN ('navy','gold','rating','sky','rose','amber','violet','emerald')
    )
);

DROP TRIGGER IF EXISTS trg_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER trg_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------

CREATE TABLE blog_posts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    category_id      UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    excerpt          TEXT,
    content          TEXT NOT NULL DEFAULT '',
    cover_image_url  TEXT,
    tags             TEXT[] NOT NULL DEFAULT '{}',
    status           TEXT NOT NULL DEFAULT 'draft',
    author_name      TEXT NOT NULL DEFAULT 'Royal Vacation Admin',
    meta_title       TEXT,
    meta_description TEXT,
    views            INTEGER NOT NULL DEFAULT 0,
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT blog_posts_status_check CHECK (status IN ('draft','published','scheduled'))
);

CREATE INDEX idx_blog_posts_category_id ON blog_posts (category_id);
CREATE INDEX idx_blog_posts_status ON blog_posts (status);

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- blog_post_translations — normalized, FK'd to the real languages table.
-- Unlike stay_setting_translations' single `value` column, a blog post
-- needs multiple translated fields per language (Title + rich Description).
-- ---------------------------------------------------------------------------

CREATE TABLE blog_post_translations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id   UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    language_code  TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    title          TEXT NOT NULL DEFAULT '',
    content        TEXT NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT blog_post_translations_unique UNIQUE (blog_post_id, language_code)
);

CREATE INDEX idx_blog_post_translations_post_id ON blog_post_translations (blog_post_id);

DROP TRIGGER IF EXISTS trg_blog_post_translations_updated_at ON blog_post_translations;
CREATE TRIGGER trg_blog_post_translations_updated_at
    BEFORE UPDATE ON blog_post_translations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- blog_comments — 2-level threaded (parent_comment_id), moderation-gated.
-- Nothing shows publicly until status='approved'; that queue is the abuse
-- mitigation (no CAPTCHA/rate-limiting in this pass). Admin replies reuse
-- this same table with is_admin_reply=true, auto-approved.
-- ---------------------------------------------------------------------------

CREATE TABLE blog_comments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_post_id       UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    parent_comment_id  UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
    author_name        TEXT NOT NULL,
    author_email       TEXT NOT NULL,
    body               TEXT NOT NULL,
    status             TEXT NOT NULL DEFAULT 'pending',
    is_admin_reply     BOOLEAN NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT blog_comments_status_check CHECK (status IN ('pending','approved','rejected'))
);

CREATE INDEX idx_blog_comments_post_id ON blog_comments (blog_post_id);
CREATE INDEX idx_blog_comments_status ON blog_comments (status);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments (parent_comment_id);

DROP TRIGGER IF EXISTS trg_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER trg_blog_comments_updated_at
    BEFORE UPDATE ON blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

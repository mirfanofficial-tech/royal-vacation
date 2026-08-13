-- Royal Vacation — CMS: `cms_content_revisions`
-- PostgreSQL 16+  |  depends on `020_cms.sql`, `019_blog.sql`
--
-- Shared, polymorphic revision-history table for CMS pages and blog posts —
-- mirrors the existing `user_activity_logs` shape (entity_type + entity_id,
-- no FK, since it spans two unrelated parent tables). `snapshot` is JSONB
-- because a revision is an opaque, never-queried-structurally historical
-- blob — unlike the live multilingual content model, which stays on
-- per-language tables. Rows are immutable/append-only (no updated_at),
-- pruned to the 50 most recent per entity on insert (see
-- backend/app/services/revisions.py).

CREATE TABLE cms_content_revisions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type  TEXT NOT NULL,
    entity_id    UUID NOT NULL,
    snapshot     JSONB NOT NULL,
    created_by   TEXT NOT NULL DEFAULT 'Royal Vacation Admin',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_content_revisions_entity_type_check CHECK (entity_type IN ('cms_page','blog_post'))
);

CREATE INDEX idx_cms_content_revisions_entity ON cms_content_revisions (entity_type, entity_id, created_at DESC);

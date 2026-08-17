-- Royal Vacation — CMS: `cms_translation_tasks`
-- PostgreSQL 16+  |  depends on `011_reference_data.sql` (languages),
-- `020_cms.sql` (cms_pages), `019_blog.sql` (blog_posts)
--
-- Lightweight "flag this page/post as needing translation into X" tracker,
-- per the Phase 3 scope decision: no assignee / inbox / reviewer workflow
-- (cms_translation_memory was explicitly dropped). A task just records a
-- target language and a status. `entity_type` + `entity_id` is polymorphic
-- (no FK — spans cms_pages and blog_posts), mirroring the existing
-- `cms_content_revisions` / `user_activity_logs` shape. `requested_by`
-- captures the acting admin's identity via `current_user.display_name or
-- current_user.email` (same pattern as revisions), not a free-text default.

CREATE TABLE cms_translation_tasks (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type          TEXT NOT NULL,
    entity_id            UUID NOT NULL,
    target_language_code TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    status               TEXT NOT NULL DEFAULT 'requested',
    requested_by         TEXT NOT NULL DEFAULT 'Royal Vacation Admin',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT cms_translation_tasks_entity_type_check CHECK (entity_type IN ('cms_page','blog_post')),
    CONSTRAINT cms_translation_tasks_status_check CHECK (status IN ('requested','done','cancelled'))
);

CREATE INDEX idx_cms_translation_tasks_entity ON cms_translation_tasks (entity_type, entity_id);
CREATE INDEX idx_cms_translation_tasks_status ON cms_translation_tasks (status);

-- At most one *active* request per entity+language. Done/cancelled rows can be
-- superseded by a fresh request (partial unique index, same pattern as
-- `uq_currencies_default`).
CREATE UNIQUE INDEX uq_cms_translation_tasks_active
    ON cms_translation_tasks (entity_type, entity_id, target_language_code)
    WHERE status = 'requested';

DROP TRIGGER IF EXISTS trg_cms_translation_tasks_updated_at ON cms_translation_tasks;
CREATE TRIGGER trg_cms_translation_tasks_updated_at
    BEFORE UPDATE ON cms_translation_tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

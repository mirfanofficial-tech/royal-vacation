-- Royal Vacation — Stays Config: `stay_settings` + `stay_setting_translations`
-- PostgreSQL 16+  |  depends on `002_roles.sql`, `003_role_permissions.sql`,
-- `004_permissions.sql`, `011_reference_data.sql` (languages)
--
-- Adds "stays" as a full RBAC module (mirrors the existing 11-module
-- registration in role_permissions/permissions), seeds Vietnamese + Polish
-- into `languages` so the translation grid matches the admin mockup, then
-- creates the setting + translation tables. `setting_type` is a fixed,
-- code-defined taxonomy (5 categories); translations are a normalized
-- child table keyed by the real `languages.code` — not a JSONB blob — so
-- adding a language later just works with no migration.

-- ---------------------------------------------------------------------------
-- RBAC: register the "stays" module
-- ---------------------------------------------------------------------------

ALTER TABLE role_permissions DROP CONSTRAINT role_permissions_module_check;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_module_check CHECK (
    module IN ('dashboard','properties','bookings','guests','modules',
               'cms','blog','reports','payments','settings','roles','stays')
);

ALTER TABLE permissions DROP CONSTRAINT permissions_resource_check;
ALTER TABLE permissions ADD CONSTRAINT permissions_resource_check CHECK (
    resource IN ('dashboard','properties','bookings','guests','modules',
                 'cms','blog','reports','payments','settings','roles','stays')
);

INSERT INTO permissions (name, resource, action, description)
SELECT a.action || '_stays', 'stays', a.action, a.label || ' Stays Configuration'
FROM (VALUES
    ('view',   'View'),
    ('create', 'Create'),
    ('edit',   'Update'),
    ('delete', 'Delete')
) AS a(action, label)
ON CONFLICT (name) DO NOTHING;

-- super_admin + admin: full CRUD on stays (matches how both already get
-- full CRUD on every other operational module)
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, 'stays', a.action
FROM roles r
CROSS JOIN (VALUES ('view'), ('create'), ('edit'), ('delete')) AS a(action)
WHERE r.name IN ('super_admin', 'admin')
ON CONFLICT (role_id, module, action) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed the two languages the mockup shows that weren't in `languages` yet
-- ---------------------------------------------------------------------------

INSERT INTO languages (code, name, native_name, is_active) VALUES
    ('vi', 'Vietnamese', 'Tiếng Việt', TRUE),
    ('pl', 'Polish',     'Polski',     TRUE)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- stay_settings — one table for all 5 setting types
-- ---------------------------------------------------------------------------

CREATE TABLE stay_settings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_type TEXT NOT NULL,
    name         TEXT NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT stay_settings_type_check CHECK (
        setting_type IN ('stay_amenity', 'room_type', 'room_amenity', 'accommodation', 'board')
    )
);

CREATE INDEX idx_stay_settings_type ON stay_settings (setting_type);

DROP TRIGGER IF EXISTS trg_stay_settings_updated_at ON stay_settings;
CREATE TRIGGER trg_stay_settings_updated_at
    BEFORE UPDATE ON stay_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- stay_setting_translations — normalized, FK'd to the real languages table
-- ---------------------------------------------------------------------------

CREATE TABLE stay_setting_translations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_setting_id UUID NOT NULL REFERENCES stay_settings(id) ON DELETE CASCADE,
    language_code   TEXT NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    value           TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT stay_setting_translations_unique UNIQUE (stay_setting_id, language_code)
);

CREATE INDEX idx_stay_setting_translations_setting ON stay_setting_translations (stay_setting_id);

DROP TRIGGER IF EXISTS trg_stay_setting_translations_updated_at ON stay_setting_translations;
CREATE TRIGGER trg_stay_setting_translations_updated_at
    BEFORE UPDATE ON stay_setting_translations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Royal Vacation — `role_permissions` (RBAC matrix)
-- PostgreSQL 16+  |  depends on `002_roles.sql`
-- Mirrors the admin app's permission matrix:
--   modules:  dashboard, properties, bookings, guests, modules, cms, blog,
--             reports, payments, settings, roles
--   actions:  view, create, edit, delete
-- "Manage" a resource = a role has all four actions (derived, not stored).

CREATE TABLE role_permissions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id    UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    module     VARCHAR(30) NOT NULL,
    action     VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT role_permissions_module_check CHECK (
        module IN ('dashboard','properties','bookings','guests','modules',
                   'cms','blog','reports','payments','settings','roles')
    ),
    CONSTRAINT role_permissions_action_check CHECK (
        action IN ('view','create','edit','delete')
    ),
    CONSTRAINT role_permissions_unique UNIQUE (role_id, module, action)
);

CREATE INDEX idx_role_permissions_role ON role_permissions (role_id);
CREATE INDEX idx_role_permissions_module ON role_permissions (module);

-- ---------------------------------------------------------------------------
-- Seed — matches admin/src/lib/mock-data.ts role permission matrix (idempotent)
-- ---------------------------------------------------------------------------

-- super_admin: full access to every module (11 modules x 4 actions)
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, m.module, a.action
FROM roles r
CROSS JOIN (VALUES
    ('dashboard'), ('properties'), ('bookings'), ('guests'), ('modules'),
    ('cms'), ('blog'), ('reports'), ('payments'), ('settings'), ('roles')
) AS m(module)
CROSS JOIN (VALUES ('view'), ('create'), ('edit'), ('delete')) AS a(action)
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- admin: full access everywhere except roles is view-only
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, m.module, a.action
FROM roles r
CROSS JOIN (VALUES
    ('dashboard'), ('properties'), ('bookings'), ('guests'), ('modules'),
    ('cms'), ('blog'), ('reports'), ('payments'), ('settings')
) AS m(module)
CROSS JOIN (VALUES ('view'), ('create'), ('edit'), ('delete')) AS a(action)
WHERE r.name = 'admin'
ON CONFLICT (role_id, module, action) DO NOTHING;

INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, 'roles', 'view'
FROM roles r
WHERE r.name = 'admin'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- manager: properties / bookings / guests CRUD + dashboard view
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, v.module, v.action
FROM roles r
CROSS JOIN (VALUES
    ('dashboard','view'),
    ('properties','view'), ('properties','create'), ('properties','edit'),
    ('bookings','view'),  ('bookings','create'),  ('bookings','edit'),
    ('guests','view'),    ('guests','create'),    ('guests','edit')
) AS v(module, action)
WHERE r.name = 'manager'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- content_editor: cms + blog full control, dashboard view
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, v.module, v.action
FROM roles r
CROSS JOIN (VALUES
    ('dashboard','view'),
    ('cms','view'), ('cms','create'), ('cms','edit'), ('cms','delete'),
    ('blog','view'), ('blog','create'), ('blog','edit'), ('blog','delete')
) AS v(module, action)
WHERE r.name = 'content_editor'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- support: read-only bookings + guests + dashboard
INSERT INTO role_permissions (role_id, module, action)
SELECT r.id, v.module, v.action
FROM roles r
CROSS JOIN (VALUES
    ('dashboard','view'),
    ('bookings','view'),
    ('guests','view')
) AS v(module, action)
WHERE r.name = 'support'
ON CONFLICT (role_id, module, action) DO NOTHING;

-- partner + traveler have no dashboard permissions (kept for future modules)

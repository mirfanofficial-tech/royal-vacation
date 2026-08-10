-- Royal Vacation — `permissions` (definition catalog / registry)
-- PostgreSQL 16+
--
-- This is the SELF-DOCUMENTING registry of every permission the system knows:
-- the full 11 modules x 4 actions cross product (44 rows).
--
-- IMPORTANT: enforcement happens in `role_permissions` (003) via
-- (role_id, module, action). This table is a read-only reference for the
-- admin UI (labels/descriptions), audits and docs — it is not queried to
-- authorize requests. Both stay in sync because they derive from the same
-- constants.

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,  -- e.g. view_properties, delete_bookings
    resource    VARCHAR(30) NOT NULL,          -- matches role_permissions.module
    action      VARCHAR(20) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT permissions_resource_check CHECK (
        resource IN ('dashboard','properties','bookings','guests','modules',
                     'cms','blog','reports','payments','settings','roles')
    ),
    CONSTRAINT permissions_action_check CHECK (
        action IN ('view','create','edit','delete')
    )
);

CREATE INDEX idx_permissions_resource_action ON permissions (resource, action);

-- Seed the full 11 x 4 catalog (idempotent)
INSERT INTO permissions (name, resource, action, description)
SELECT a.action || '_' || m.resource,
       m.resource,
       a.action,
       a.label || ' ' || m.label
FROM (VALUES
    ('dashboard',  'Dashboard'),
    ('properties', 'Properties'),
    ('bookings',   'Bookings'),
    ('guests',     'Guests'),
    ('modules',    'Integrations'),
    ('cms',        'CMS'),
    ('blog',       'Blog'),
    ('reports',    'Reports'),
    ('payments',   'Payments'),
    ('settings',   'Settings'),
    ('roles',      'Roles & Permissions')
) AS m(resource, label)
CROSS JOIN (VALUES
    ('view',   'View'),
    ('create', 'Create'),
    ('edit',   'Update'),
    ('delete', 'Delete')
) AS a(action, label)
ON CONFLICT (name) DO NOTHING;

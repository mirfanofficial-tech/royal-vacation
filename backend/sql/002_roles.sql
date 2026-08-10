-- Royal Vacation — `roles`
-- PostgreSQL 16+  |  depends on `001_users.sql` (set_updated_at trigger fn)
-- RBAC source of truth lives in `role_permissions` (003); `level` is an
-- ordering/hierarchy hint for the admin UI, not an enforcement mechanism.

CREATE TABLE roles (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(50) UNIQUE NOT NULL,  -- stable code: super_admin, admin, ...
    display_name VARCHAR(100) NOT NULL,
    description  TEXT,
    level        INT NOT NULL,                 -- higher = more responsibility (UI ordering)
    is_system    BOOLEAN NOT NULL DEFAULT FALSE,
    status       VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT roles_name_key        UNIQUE (name),
    CONSTRAINT roles_status_check    CHECK (status IN ('active', 'inactive')),
    CONSTRAINT roles_level_range     CHECK (level >= 0)
);

DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Default roles (idempotent — safe to re-run)
INSERT INTO roles (name, display_name, description, level, is_system, status) VALUES
    ('super_admin',    'Super Administrator', 'Full system access and control',        100, TRUE,  'active'),
    ('admin',          'Administrator',       'Day-to-day operations and management',  80,  TRUE,  'active'),
    ('manager',        'Manager',             'Manages properties, bookings, guests',  70,  TRUE,  'active'),
    ('content_editor', 'Content Editor',      'Owns blog posts, pages and menus',      60,  TRUE,  'active'),
    ('support',        'Support Agent',       'Customer support and ticket management', 50,  TRUE,  'active'),
    ('partner',        'Property Agent',      'Manage their properties and bookings',  40,  TRUE,  'active'),
    ('traveler',       'Traveler',            'Customer with a booking account',       20,  FALSE, 'active')
ON CONFLICT (name) DO NOTHING;

-- Royal Vacation — `user_roles` (users <-> roles, many-to-many)
-- PostgreSQL 16+  |  depends on `001_users.sql`, `002_roles.sql`
--
-- Replaces users.role_id (removed in 001): a user can hold several roles
-- (e.g. Manager + Content Editor). The admin app's single-role picker maps to
-- exactly one ACTIVE row here. Roles expire via expires_at (NULL = no expiry).

CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users (id) ON DELETE SET NULL, -- NULL = self/system
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT user_roles_expires_check CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_user_roles_role ON user_roles (role_id);

-- One ACTIVE assignment per (user, role); deactivated rows stay for history.
CREATE UNIQUE INDEX uq_user_roles_active
    ON user_roles (user_id, role_id)
    WHERE is_active;

-- Royal Vacation — `user_sessions` (auth sessions)
-- PostgreSQL 16+  |  depends on `001_users.sql`
--
-- SECURITY: store SHA-256 hashes of the raw session/refresh tokens (the API
-- receives the raw token, hashes it, and looks up by hash). If the DB leaks,
-- tokens are not reusable. The UNIQUE columns below are intended to hold the
-- hex digests (64 chars).

CREATE TABLE user_sessions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    session_token    VARCHAR(255) UNIQUE NOT NULL,
    refresh_token    VARCHAR(255) UNIQUE,
    device_type      VARCHAR(20) NOT NULL DEFAULT 'desktop',
    device_name      VARCHAR(255),
    browser          VARCHAR(100),
    os               VARCHAR(100),
    ip_address       INET,
    location         VARCHAR(255),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at       TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT user_sessions_device_type_check CHECK (
        device_type IN ('desktop', 'mobile', 'tablet', 'other')
    ),
    CONSTRAINT user_sessions_expires_check CHECK (expires_at > created_at)
);

CREATE INDEX idx_user_sessions_user    ON user_sessions (user_id);
CREATE INDEX idx_user_sessions_active  ON user_sessions (user_id) WHERE is_active;
CREATE INDEX idx_user_sessions_expires ON user_sessions (expires_at);
-- session_token / refresh_token are indexed automatically by their UNIQUE constraints.

DROP TRIGGER IF EXISTS trg_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trg_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

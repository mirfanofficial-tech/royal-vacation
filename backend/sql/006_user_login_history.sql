-- Royal Vacation — `user_login_history` (auth audit log)
-- PostgreSQL 16+  |  depends on `001_users.sql`
--
-- Append-only: every login attempt (success, failure, lockout) is recorded
-- for audit + the lockout rule. Intentionally NO updated_at / trigger.
-- user_id is nullable because failed attempts may reference an email that
-- does not resolve to a user yet — log the attempted email instead.

CREATE TABLE user_login_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users (id) ON DELETE CASCADE,
    email          VARCHAR(255),   -- attempted identifier (always set)
    login_type     VARCHAR(20) NOT NULL DEFAULT 'email',
    ip_address     INET,
    user_agent     TEXT,
    location       VARCHAR(255),
    status         VARCHAR(20) NOT NULL,
    failure_reason TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT user_login_history_type_check CHECK (
        login_type IN ('email', 'google', 'apple', 'facebook', 'phone', 'token')
    ),
    CONSTRAINT user_login_history_status_check CHECK (
        status IN ('success', 'failed', 'locked')
    )
);

CREATE INDEX idx_login_history_user    ON user_login_history (user_id);
CREATE INDEX idx_login_history_created ON user_login_history (created_at);
-- Lockout rule: count recent failed/locked attempts per email fast.
CREATE INDEX idx_login_history_email_failed
    ON user_login_history (email)
    WHERE status IN ('failed', 'locked');

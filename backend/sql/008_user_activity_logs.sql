-- Royal Vacation — `user_activity_logs` (action audit trail)
-- PostgreSQL 16+  |  depends on `001_users.sql`, `005_user_sessions.sql`
--
-- Append-only audit of user actions. NO updated_at / trigger (deliberate).
-- `action` and `resource_type` are intentionally free-form (no CHECK): the
-- catalog grows, so follow a naming convention instead —
--   action:        verb_noun        -> booking_created, user_updated, refund_processed
--   resource_type: domain entity    -> user, guest, property, booking, payment,
--                                      refund, invoice, payout, blog, cms_page,
--                                      settings, role
-- resource_id is polymorphic (no FK): store the UUID PK of resource_type.

CREATE TABLE user_activity_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users (id) ON DELETE SET NULL,
    session_id    UUID REFERENCES user_sessions (id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id   UUID,
    details       JSONB,
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_user     ON user_activity_logs (user_id, created_at);
CREATE INDEX idx_activity_created  ON user_activity_logs (created_at);
CREATE INDEX idx_activity_resource ON user_activity_logs (resource_type, resource_id);

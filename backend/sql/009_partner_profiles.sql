-- Royal Vacation — `partner_profiles` (partner account_type business profile)
-- PostgreSQL 16+  |  depends on `001_users.sql`
--
-- One profile per partner user (UNIQUE user_id). Bank/payout details belong
-- in a future `partner_bank_accounts` table (not stored here).
-- commission_rate is a PERCENTAGE (10.00 = 10%), consistent with the admin UI.

CREATE TABLE partner_profiles (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                       UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    business_name                 VARCHAR(255) NOT NULL,
    business_registration_number  VARCHAR(100) UNIQUE,
    tax_id                        VARCHAR(100),
    business_license_url          VARCHAR(500),
    logo_url                      VARCHAR(500),
    website                       VARCHAR(255),
    business_phone                VARCHAR(50),
    business_email                VARCHAR(255),
    business_address              TEXT,
    business_city                 VARCHAR(100),
    business_country              VARCHAR(100),

    -- Verification
    is_verified                   BOOLEAN NOT NULL DEFAULT FALSE,
    verification_documents        JSONB,          -- [{type, url, uploaded_at}]
    verification_notes            TEXT,
    verified_by                   UUID REFERENCES users (id) ON DELETE SET NULL,
    verified_at                   TIMESTAMPTZ,

    -- Settings
    commission_rate               NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    payment_terms                 VARCHAR(20) NOT NULL DEFAULT 'monthly',
    auto_confirm_bookings         BOOLEAN NOT NULL DEFAULT TRUE,
    max_cancellation_days         INT NOT NULL DEFAULT 7,

    -- Status
    status                        VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT partner_profiles_status_check CHECK (
        status IN ('pending', 'active', 'suspended', 'terminated', 'rejected')
    ),
    CONSTRAINT partner_profiles_payment_terms_check CHECK (
        payment_terms IN ('weekly', 'biweekly', 'monthly')
    ),
    CONSTRAINT partner_profiles_commission_check CHECK (
        commission_rate >= 0 AND commission_rate <= 100
    ),
    CONSTRAINT partner_profiles_max_cancellation_check CHECK (
        max_cancellation_days >= 0
    )
);

CREATE INDEX idx_partner_profiles_status ON partner_profiles (status);
-- user_id is indexed automatically by its UNIQUE constraint.

DROP TRIGGER IF EXISTS trg_partner_profiles_updated_at ON partner_profiles;
CREATE TRIGGER trg_partner_profiles_updated_at
    BEFORE UPDATE ON partner_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

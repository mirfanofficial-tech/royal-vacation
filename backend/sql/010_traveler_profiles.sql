-- Royal Vacation — `traveler_profiles` (traveler account_type profile)
-- PostgreSQL 16+  |  depends on `001_users.sql`
--
-- One profile per traveler user (UNIQUE user_id).
-- loyalty_points / total_bookings / total_spent are CACHED counters: update
-- them in the SAME transaction as the booking/payment write so they never
-- drift from `bookings` / `payment_transactions`. total_spent is in AED.

CREATE TABLE traveler_profiles (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,

    -- Loyalty
    loyalty_points              INT NOT NULL DEFAULT 0,
    loyalty_tier                VARCHAR(20) NOT NULL DEFAULT 'bronze',
    total_bookings              INT NOT NULL DEFAULT 0,
    total_spent                 NUMERIC(14, 2) NOT NULL DEFAULT 0,
    preferred_room_type         VARCHAR(50),
    preferred_meal_plan         VARCHAR(50),

    -- Passport / ID (optional)
    passport_number             VARCHAR(50),
    passport_expiry             DATE,
    nationality                 VARCHAR(100),
    emergency_contact_name      VARCHAR(255),
    emergency_contact_phone     VARCHAR(50),

    -- Preferences
    preferred_airlines          JSONB,          -- [airline_id, ...]
    preferred_hotels            JSONB,          -- [property_id, ...]
    special_requests            TEXT,

    -- Marketing
    newsletter_subscribed       BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_consent_given     BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_consent_given_at  TIMESTAMPTZ,

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT traveler_profiles_loyalty_tier_check CHECK (
        loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')
    ),
    CONSTRAINT traveler_profiles_loyalty_points_check CHECK (loyalty_points >= 0),
    CONSTRAINT traveler_profiles_total_bookings_check CHECK (total_bookings >= 0),
    CONSTRAINT traveler_profiles_total_spent_check CHECK (total_spent >= 0),
    CONSTRAINT traveler_profiles_consent_check CHECK (
        NOT marketing_consent_given OR marketing_consent_given_at IS NOT NULL
    )
);

CREATE INDEX idx_traveler_profiles_tier ON traveler_profiles (loyalty_tier);
-- user_id is indexed automatically by its UNIQUE constraint.

DROP TRIGGER IF EXISTS trg_traveler_profiles_updated_at ON traveler_profiles;
CREATE TRIGGER trg_traveler_profiles_updated_at
    BEFORE UPDATE ON traveler_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

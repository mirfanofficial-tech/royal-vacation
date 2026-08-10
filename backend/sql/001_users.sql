-- Royal Vacation — `users` (unified: travelers, partners, admins)
-- PostgreSQL 16+
-- FKs below reference tables created in later migrations:
--   roles.id, currencies.code, languages.code
-- gen_random_uuid() is core in PG 13+ (no pgcrypto needed).

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255),
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    display_name        VARCHAR(255),
    phone               VARCHAR(50),
    profile_picture     VARCHAR(500),
    date_of_birth       DATE,
    gender              VARCHAR(20),
    account_type        VARCHAR(20) NOT NULL DEFAULT 'traveler',
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    email_verified_at   TIMESTAMPTZ,
    phone_verified_at   TIMESTAMPTZ,
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret   VARCHAR(255),
    login_attempts      INTEGER NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    last_ip_address     INET,
    preferred_currency  CHAR(3) NOT NULL DEFAULT 'AED',
    preferred_language  VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone            VARCHAR(50) NOT NULL DEFAULT 'Asia/Dubai',
    country             VARCHAR(100),
    city                VARCHAR(100),
    address             TEXT,
    zip_code            VARCHAR(20),
    invited_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT users_email_key        UNIQUE (email),
    CONSTRAINT users_gender_check     CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
    CONSTRAINT users_account_type_check CHECK (account_type IN ('traveler', 'partner', 'admin')),
    CONSTRAINT users_status_check     CHECK (status IN ('pending', 'active', 'invited', 'inactive', 'suspended', 'deleted')),
    CONSTRAINT users_invited_by_fk    FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT users_currency_fk      FOREIGN KEY (preferred_currency) REFERENCES currencies (code) ON DELETE RESTRICT,
    CONSTRAINT users_language_fk      FOREIGN KEY (preferred_language) REFERENCES languages (code) ON DELETE RESTRICT
);

CREATE INDEX idx_users_account_type_status ON users (account_type, status);
CREATE INDEX idx_users_created_at       ON users (created_at);

-- Keep updated_at in sync (shared by every table in this project).
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

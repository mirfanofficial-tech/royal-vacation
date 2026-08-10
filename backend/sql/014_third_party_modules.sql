-- Royal Vacation — `third_party_modules` (admin settings)
-- PostgreSQL 16+  |  depends on `001_users.sql` (set_updated_at trigger fn)
--
-- Manages third-party API providers powering bookings (ferries, flights,
-- tours, transfers, car rental, insurance, ...). `credential_schema` is the
-- plain (non-secret) field metadata (key/label/secret/required) for each
-- provider — it never changes at runtime. `credentials_encrypted` is a
-- single Fernet-encrypted blob (`{key: value}`) built/read by
-- app/core/crypto.py — never plaintext, same one-blob-per-row pattern as
-- `payment_gateways.credentials_encrypted`.
--
-- Seeded credentials below are the same demo/sandbox values the admin mock
-- data already shipped (not real, safe to commit) and are pre-encrypted
-- with the DEV DEFAULT PAYMENT_CREDENTIALS_ENCRYPTION_KEY from
-- app/core/config.py. They will only decrypt correctly while that default
-- key is in use — rotate the key in production and these become unreadable
-- (expected). CarTrawler's mock credentials were already empty strings, so
-- its `credentials_encrypted` is left NULL.

CREATE TABLE third_party_modules (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider              TEXT NOT NULL UNIQUE,
    module_id             TEXT NOT NULL,
    name                  TEXT NOT NULL,
    category              TEXT NOT NULL,
    status                TEXT NOT NULL DEFAULT 'inactive',
    ai_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
    environment           TEXT NOT NULL DEFAULT 'development',
    markup_b2b_type       TEXT NOT NULL DEFAULT 'percentage',
    markup_b2b_value      NUMERIC(10, 2) NOT NULL DEFAULT 0,
    markup_b2c_type       TEXT NOT NULL DEFAULT 'percentage',
    markup_b2c_value      NUMERIC(10, 2) NOT NULL DEFAULT 0,
    base_currency         TEXT NOT NULL DEFAULT '',
    tax_type              TEXT NOT NULL DEFAULT 'percentage',
    tax_value             NUMERIC(10, 2) NOT NULL DEFAULT 0,
    credential_schema     JSONB NOT NULL DEFAULT '[]'::jsonb,
    credentials_encrypted TEXT,
    help_text             TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT third_party_modules_status_check CHECK (status IN ('active', 'inactive')),
    CONSTRAINT third_party_modules_environment_check CHECK (environment IN ('development', 'staging', 'production')),
    CONSTRAINT third_party_modules_markup_b2b_type_check CHECK (markup_b2b_type IN ('percentage', 'flat')),
    CONSTRAINT third_party_modules_markup_b2c_type_check CHECK (markup_b2c_type IN ('percentage', 'flat')),
    CONSTRAINT third_party_modules_tax_type_check CHECK (tax_type IN ('percentage', 'flat'))
);

DROP TRIGGER IF EXISTS trg_third_party_modules_updated_at ON third_party_modules;
CREATE TRIGGER trg_third_party_modules_updated_at
    BEFORE UPDATE ON third_party_modules
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Starter providers matching the admin UI demo set, with sandbox API keys so
-- the Modules page is testable end-to-end out of the box.
INSERT INTO third_party_modules
    (provider, module_id, name, category, status, ai_enabled, environment,
     markup_b2b_type, markup_b2b_value, markup_b2c_type, markup_b2c_value,
     base_currency, tax_type, tax_value, credential_schema, credentials_encrypted, help_text)
VALUES
    ('kikoto', '41', 'Kikoto', 'Ferries Module', 'active', TRUE, 'development',
     'percentage', 2, 'percentage', 5,
     'EUR - United Kingdom', 'percentage', 5,
     '[{"key": "bearerToken", "label": "Bearer Token", "secret": true, "required": true}, {"key": "baseUrl", "label": "Base URL", "secret": false, "required": true}]',
     'gAAAAABqedirx9ffB0ezVs1jwTl_v8LaZ8Tc2B4EceokBLz3ZJ1ZQhPAZsJR1Dg2vlPA7PSY35b1tbRuKqbW6yXBjlQW9bx3LY-wzj1oSTwV9UO7-jJn3dAn6dHHuBuEsYvlGTZkSYEQHsyaJtUvpM5QrhMtH2CuG2tKW6mbVeItsCPr-4CXk_wgVr3bhGQkr5ALNKpIIO3C',
     'Search, book and manage ferry routes and tickets across the region through the Kikoto ferry distribution network.'),

    ('amadeus', '12', 'Amadeus', 'Flights Module', 'active', FALSE, 'production',
     'percentage', 3, 'percentage', 8,
     'USD - United States', 'flat', 1,
     '[{"key": "apiKey", "label": "API Key", "secret": true, "required": true}, {"key": "apiSecret", "label": "API Secret", "secret": true, "required": true}]',
     'gAAAAABqedir3n1-Bc4Sqkdcikqe2YByvaWhyppLh7_gvqj7x-75ieOvw8koj3ed4ke5egxOuJOG6xtbNfQTemEMMMi6MbVVxARmGKV3d7riEdcMVCIUvfJ-pOaw8BVbrzu69smZtw7ZsdlHOz5R59-Kb5S3jiPqW_IeluC5C28JgcR0xH4yWeI=',
     'Real-time flight search, pricing and booking through the Amadeus Travel API.'),

    ('viator', '27', 'Viator', 'Tours & Activities Module', 'active', FALSE, 'development',
     'percentage', 10, 'percentage', 15,
     'EUR - United Kingdom', 'percentage', 5,
     '[{"key": "apiKey", "label": "API Key", "secret": true, "required": true}]',
     'gAAAAABqedirK1Ck_geLPzCZqfeOAopOP9FpX0kXqmidEz35TsOKQ_hmKC420n6bF-UnWVNgBuKROhorYrz4u3XNTK1h-UvWah9tH8UYr0PdhkbC6gmvbFPd0Ld6DNm3ZuhWsqCh8gnM',
     'Browse and sell tours, experiences and activities from Viator''s global catalog.'),

    ('welcome-pickups', '34', 'Welcome Pickups', 'Transfers Module', 'active', TRUE, 'production',
     'percentage', 12, 'percentage', 18,
     'AED - United Arab Emirates', 'percentage', 0,
     '[{"key": "bearerToken", "label": "Bearer Token", "secret": true, "required": true}, {"key": "baseUrl", "label": "Base URL", "secret": false, "required": true}]',
     'gAAAAABqedirw6sVd-6h0tPsefOJLk_HSi0JXLLOkmwKjqSBGqIDqxY2d4CM8fGWYy-p0p-umlMe2zgtxBdjrQQZb6omGZ2xag_bU1ckDhnykSNi40Vw-p5MwTo2hKFcJmgrkHrwIpgiT3QgrUlHlj9IE2rBuqGScAmLg8WO_RhmgHn2pOfya266AkUjxWtsIJQdoK8lFpFs',
     'Airport transfers and chauffeur services available for booking across all destinations.'),

    ('cartrawler', '18', 'CarTrawler', 'Car Rental Module', 'inactive', FALSE, 'development',
     'percentage', 5, 'percentage', 10,
     'USD - United States', 'flat', 2,
     '[{"key": "clientId", "label": "Client ID", "secret": false, "required": true}, {"key": "clientSecret", "label": "Client Secret", "secret": true, "required": true}, {"key": "baseUrl", "label": "Base URL", "secret": false, "required": true}]',
     NULL,
     'Compare and book car rentals from leading global suppliers.'),

    ('safetywing', '52', 'SafetyWing', 'Insurance Module', 'active', TRUE, 'staging',
     'percentage', 8, 'percentage', 15,
     'GBP - United Kingdom', 'percentage', 5,
     '[{"key": "apiKey", "label": "API Key", "secret": true, "required": true}, {"key": "baseUrl", "label": "Base URL", "secret": false, "required": true}]',
     'gAAAAABqediruj0-bH4ANlGTV-TCsKTVKxEwcSwteXB2pflIVv-lMxUrLB32Ub8uzia6f2jLZ9iiiMZiZWoz9uGE1aa0fGkDOzF0xjOupOdUhVj4pnVbEdbXcV1FKpGQb7cNEVP4wBL1Cvj8ex2SKj-ggQG1kR1OLkYNHEpw1fNPapC5X-bUKx4=',
     'Add travel insurance coverage options at checkout for every booking.')
ON CONFLICT (provider) DO NOTHING;

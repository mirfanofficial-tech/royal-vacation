-- Royal Vacation — `payment_gateways` (admin settings)
-- PostgreSQL 16+  |  depends on `001_users.sql` (set_updated_at trigger fn)
--
-- Credentials are stored as a single Fernet-encrypted blob (`credentials_encrypted`)
-- built/read by app/core/crypto.py — never plaintext, never queryable JSONB
-- (defeats the point of encrypting it). `currencies` stays a loose JSONB tag
-- list (not FK-constrained to `currencies.code`) — informational only, same
-- pattern as `partner_profiles.preferred_airlines`/`preferred_hotels`.
--
-- Seeded credentials below are demo/sandbox keys (not real, safe to commit) and
-- are pre-encrypted with the DEV DEFAULT PAYMENT_CREDENTIALS_ENCRYPTION_KEY from
-- app/core/config.py. They will only decrypt correctly while that default key is
-- in use — rotate the key in production and these become unreadable (expected).

CREATE TABLE payment_gateways (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                  TEXT NOT NULL UNIQUE,
    name                  TEXT NOT NULL,
    description           TEXT,
    status                TEXT NOT NULL DEFAULT 'test',
    is_default            BOOLEAN NOT NULL DEFAULT FALSE,
    currencies            JSONB NOT NULL DEFAULT '[]'::jsonb,
    credentials_encrypted TEXT,
    success_url           TEXT,
    cancel_url            TEXT,
    webhook_url           TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT payment_gateways_status_check CHECK (status IN ('active', 'test', 'inactive'))
);

-- Only one gateway may be the default at a time.
CREATE UNIQUE INDEX uq_payment_gateways_default
    ON payment_gateways (is_default)
    WHERE is_default;

DROP TRIGGER IF EXISTS trg_payment_gateways_updated_at ON payment_gateways;
CREATE TRIGGER trg_payment_gateways_updated_at
    BEFORE UPDATE ON payment_gateways
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Starter gateways matching the admin UI demo set, with sandbox API keys so the
-- Settings > Payment Gateways page is testable end-to-end out of the box.
INSERT INTO payment_gateways
    (code, name, description, status, is_default, currencies, credentials_encrypted, success_url, cancel_url, webhook_url)
VALUES
    ('checkout_com', 'Checkout.com', 'Global payments platform with card, Apple Pay and Google Pay support.', 'test', TRUE, '["AED", "USD", "EUR"]', 'gAAAAABqedKZWiv01CBwUp-kT2T_GupU3t79JgvZ3nR7MMlTsY01yyc88h1OWxezG82QsOkHQ0E5feXBmu0SuOKpcN8tGD9ISj0BY0qN_gnV44tQbo48upRhzjjoiffNKkrrINqJnXxNwINZV6ckkF1RUkEzAHimgaBrHCTHtCOf8TeOsFYIQpVg830IXj3okeJBAxNY58fRf0mt7sZTucfXO5chbTcMcABgfSYuaACB-Vq_xVDZr1NVxiVjanKsbwaZU2fa0vooPPmJZSe3d05L4vvc5KKyk20ERNunNbtI3ecfB0d_AjE=', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/checkout'),
    ('stripe', 'Stripe', 'Online payment processing with broad international coverage.', 'test', FALSE, '["AED", "USD", "EUR", "GBP"]', 'gAAAAABqedKZ28zAf6_SZdQNu8BJX1SHAGH3vA0sJJ9VLDmLIYTNizay5rlLZoj4SeuLHutvtjXEaLBMwINaRrOAKInw9ZNyzYA1eAXcB-nZJg8qabB8FdkjP_8PuMM2J0j3oMtM9HKBD8O4vTsVzt9CH3m86oz31wnr4H9Hwa2LJ74ioyVyEupvPTl9MdEMqxd1eutHh1vskzVRyXVgTlPuGbbELAIe8QLla2lGQUpinNj3y_o08oM3nKXMgci8qqSjaB25GDjor5Kl5a9H7dzaAjTMl0oNBkFVXOA-aw-uv-sY3BTByIwllc6sL46CKYWW8aO1tEMt', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/stripe'),
    ('tap_payments', 'Tap Payments', 'Payments provider popular across the MENA region.', 'test', FALSE, '["AED", "SAR", "KWD", "QAR"]', 'gAAAAABqedKZsV_prD-SRSOEtHFojm_XjhHEsM42YSwtfnoDvm0vfX9_uwodcesQcpUiJD4xe9d8K3BUKuhED5kjMxuGsVYi9Kz0FdmMwt6sLGCY1k613iR_x85exiPuk9sqVA7Hcj0xZeh22UGefmgaXteOUnuNVQtf8Y0H8Cn7nKG9CXdiQe8q4NGrcT2p75H4kwhynga7hagMm_1DtPPAlbA6UdA5m2VeudlLS8uPfkaL26ytvpWXc6aVDJCwutp7vWDAGQfckK_hhr696l5lyB0zcew6cN_-gvFYxdsJdhva6PAqKUQ=', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/tap'),
    ('paypal', 'PayPal', 'Digital wallet payments trusted by international guests.', 'test', FALSE, '["USD", "EUR", "GBP"]', 'gAAAAABqedKZpPWDNKnG1l7UoK6WdrH1mk-3ExkJD2JI87pUOWwmliC3PePbd62LMrHsirgfRl0ufFQx-cnkhcMvuCH2ONYkoNF3oDPb36n46K5dFQkW_zv1G0aZJnnPpcsb2L-b4RQzKz3-rMln9f-sqv1DcYrNRN0QycvWpWpkmLSHysNUtbvIQPgOLKW20zgRixRIKhochcho2UZ-SoZ10p8T3GuLanvKNT7odErk3mb-aWvFeI3VmY-Nz4fXCnyi7l-wv9jBwD3WNYg4ocxbpn-g7bpaSw==', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/paypal'),
    ('mada', 'mada', 'Saudi Arabia''s national card network.', 'test', FALSE, '["SAR"]', 'gAAAAABqedKZ1YfqAgIU2UcSuRZ0184ve7ERcAqogH4_KCQ6HtQfG-5EOUpUGF7ESxYa73FIE5yBWUY9QEbMsdTE1h9JmLeXWVC6-OF2D2HehGJPYYvYDt72SAe8pfxsT6-sd9pXHI_yTjZ1yb_i8flw6cKcs1xHPfEjJttrDAO9IqXNXxpp7Wbwg1_qt9-RVwWjt0X26eB98xujALIByeae5txBBDEPmjN6vd2ZK4UUyO24Ux5ZJKhRtTfQ_FjOd_Tlb-aoy9hw70KpegYq1WUivjbS7NQ11XTHzi4lXkPFnyYBPwz3I9I=', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/mada'),
    ('paytabs', 'Paytabs', 'Payment gateway serving the Middle East and Africa.', 'inactive', FALSE, '["AED", "SAR", "EGP"]', 'gAAAAABqedKZYwgZyvdM_DZvm8zZIA6fwKXZwXmbsZWoE-q7gGUZ1Hq6jl5EA2IvaeZa6uwFvX6QMkX_9ow-nXkZ-Uhzi-9PKIPgWJ0sG0llzGXnRdZqex7ul2hTMuuRibbkgU2k2QLXSkv8ZTkDtCS0qbvtQgNRtdNL4E1ZGunHmWMwQTKuvig7hpbyvo8nGknCWX2Qbl2yPhQLP3vOlVeh0-HlZTqZYZggaZChf8T-kUJNSpQVUmfJ_tsBRpsQF5PYcbZcWqP1Ef7qmqoE0aTEXHn-6waQMw==', 'https://royalvacation.com/booking/complete', 'https://royalvacation.com/booking/checkout', 'https://api.royalvacation.com/v1/webhooks/paytabs')
ON CONFLICT (code) DO NOTHING;

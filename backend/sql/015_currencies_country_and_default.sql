-- Royal Vacation — currencies: country link + single-default flag
-- PostgreSQL 16+  |  depends on `011_reference_data.sql` (currencies, countries)
--
-- `country_code` links a currency to its natural owning country (nullable —
-- EUR has no single owning country in the seeded list). `is_default` follows
-- the same single-default pattern as `payment_gateways.is_default`: a
-- partial unique index enforces at most one default row at a time.

ALTER TABLE currencies
    ADD COLUMN country_code CHAR(2) REFERENCES countries(code) ON DELETE RESTRICT,
    ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_currencies_default
    ON currencies (is_default)
    WHERE is_default;

UPDATE currencies SET is_default = TRUE WHERE code = 'AED';

UPDATE currencies SET country_code = m.country
FROM (VALUES
    ('AED', 'AE'), ('USD', 'US'), ('GBP', 'GB'), ('SAR', 'SA'), ('KWD', 'KW'),
    ('BHD', 'BH'), ('QAR', 'QA'), ('OMR', 'OM'), ('INR', 'IN'), ('PKR', 'PK'),
    ('EGP', 'EG'), ('TRY', 'TR'), ('CNY', 'CN'), ('JPY', 'JP'), ('AUD', 'AU'),
    ('CAD', 'CA'), ('CHF', 'CH'), ('RUB', 'RU'), ('THB', 'TH')
) AS m(currency, country)
WHERE currencies.code = m.currency;
-- EUR intentionally left with country_code IS NULL (no single owning country).

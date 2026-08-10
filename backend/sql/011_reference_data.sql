-- Royal Vacation — reference data: `currencies`, `languages`, `countries`
-- PostgreSQL 16+
-- Required before seeding `users` (FKs on preferred_currency / preferred_language).
-- Every table keeps the project UUID PK; natural codes stay UNIQUE so the
-- `users` FK on `currencies(code)` / `languages(code)` works unchanged.

-- ---------------------------------------------------------------------------
-- currencies — rates are AED-per-unit, refreshed by a scheduler/seed job.
-- ---------------------------------------------------------------------------
CREATE TABLE currencies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(3) NOT NULL UNIQUE,
    symbol      VARCHAR(10) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    rate_to_aed NUMERIC(14, 6) NOT NULL DEFAULT 1,  -- 1 unit = this many AED
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT currencies_rate_check CHECK (rate_to_aed > 0)
);

DROP TRIGGER IF EXISTS trg_currencies_updated_at ON currencies;
CREATE TRIGGER trg_currencies_updated_at
    BEFORE UPDATE ON currencies
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Base + common booking currencies (idempotent)
INSERT INTO currencies (code, symbol, name, rate_to_aed, is_active) VALUES
    ('AED', 'AED', 'UAE Dirham',              1.000000, TRUE),
    ('USD', 'US$', 'US Dollar',               3.672500, TRUE),
    ('EUR', 'EUR', 'Euro',                    4.005000, TRUE),
    ('GBP', 'GB£', 'British Pound',           4.690000, TRUE),
    ('SAR', 'SAR', 'Saudi Riyal',             0.979300, TRUE),
    ('KWD', 'KWD', 'Kuwaiti Dinar',          12.020000, TRUE),
    ('BHD', 'BHD', 'Bahraini Dinar',          9.740000, TRUE),
    ('QAR', 'QAR', 'Qatari Riyal',            1.008600, TRUE),
    ('OMR', 'OMR', 'Omani Rial',              9.540000, TRUE),
    ('INR', '₹',  'Indian Rupee',             0.043900, TRUE),
    ('PKR', 'PKR', 'Pakistani Rupee',         0.013200, TRUE),
    ('EGP', 'EGP', 'Egyptian Pound',          0.075000, TRUE),
    ('TRY', 'TRY', 'Turkish Lira',            0.112000, TRUE),
    ('CNY', 'CN¥', 'Chinese Yuan',            0.512000, TRUE),
    ('JPY', 'JP¥', 'Japanese Yen',            0.024500, TRUE),
    ('AUD', 'A$',  'Australian Dollar',       2.410000, TRUE),
    ('CAD', 'C$',  'Canadian Dollar',         2.680000, TRUE),
    ('CHF', 'CHF', 'Swiss Franc',             4.190000, TRUE),
    ('RUB', 'RUB', 'Russian Ruble',           0.039800, TRUE),
    ('THB', '฿',   'Thai Baht',               0.101500, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- languages — BCP-47-ish codes (VARCHAR to allow e.g. 'zh-Hant')
-- ---------------------------------------------------------------------------
CREATE TABLE languages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_languages_updated_at ON languages;
CREATE TRIGGER trg_languages_updated_at
    BEFORE UPDATE ON languages
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

INSERT INTO languages (code, name, native_name, is_active) VALUES
    ('en',    'English',      'English',            TRUE),
    ('ar',    'Arabic',       'العربية',            TRUE),
    ('fr',    'French',       'Français',           TRUE),
    ('de',    'German',       'Deutsch',            TRUE),
    ('es',    'Spanish',      'Español',            TRUE),
    ('it',    'Italian',      'Italiano',           TRUE),
    ('hi',    'Hindi',        'हिन्दी',             TRUE),
    ('ur',    'Urdu',         'اردو',               TRUE),
    ('ru',    'Russian',      'Русский',            TRUE),
    ('tr',    'Turkish',      'Türkçe',             TRUE),
    ('zh-CN', 'Chinese (S)',  '简体中文',            TRUE),
    ('zh-Hant', 'Chinese (T)','繁體中文',            FALSE),
    ('pt',    'Portuguese',   'Português',          TRUE),
    ('nl',    'Dutch',        'Nederlands',         TRUE)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- countries — ISO 3166-1 alpha-2 code, dial_code without leading '+'
-- ---------------------------------------------------------------------------
CREATE TABLE countries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code       CHAR(2) NOT NULL UNIQUE,
    name       VARCHAR(100) NOT NULL,
    dial_code  VARCHAR(6) NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_countries_updated_at ON countries;
CREATE TRIGGER trg_countries_updated_at
    BEFORE UPDATE ON countries
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

INSERT INTO countries (code, name, dial_code, is_active) VALUES
    ('AE', 'United Arab Emirates', '971', TRUE),
    ('SA', 'Saudi Arabia',         '966', TRUE),
    ('KW', 'Kuwait',               '965', TRUE),
    ('BH', 'Bahrain',              '973', TRUE),
    ('QA', 'Qatar',                '974', TRUE),
    ('OM', 'Oman',                 '968', TRUE),
    ('US', 'United States',        '1',   TRUE),
    ('GB', 'United Kingdom',       '44',  TRUE),
    ('IN', 'India',                '91',  TRUE),
    ('PK', 'Pakistan',             '92',  TRUE),
    ('EG', 'Egypt',                '20',  TRUE),
    ('TR', 'Turkey',               '90',  TRUE),
    ('FR', 'France',               '33',  TRUE),
    ('DE', 'Germany',              '49',  TRUE),
    ('ES', 'Spain',                '34',  TRUE),
    ('IT', 'Italy',                '39',  TRUE),
    ('CH', 'Switzerland',          '41',  TRUE),
    ('RU', 'Russia',               '7',   TRUE),
    ('CN', 'China',                '86',  TRUE),
    ('JP', 'Japan',                '81',  TRUE),
    ('KR', 'South Korea',          '82',  TRUE),
    ('TH', 'Thailand',             '66',  TRUE),
    ('MY', 'Malaysia',             '60',  TRUE),
    ('SG', 'Singapore',            '65',  TRUE),
    ('ID', 'Indonesia',            '62',  TRUE),
    ('PH', 'Philippines',          '63',  TRUE),
    ('VN', 'Vietnam',              '84',  TRUE),
    ('AU', 'Australia',            '61',  TRUE),
    ('CA', 'Canada',               '1',   TRUE),
    ('NL', 'Netherlands',          '31',  TRUE)
ON CONFLICT (code) DO NOTHING;

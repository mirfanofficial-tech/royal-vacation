"""seed prod baseline: rbac + reference data + super admin

Revision ID: 976a4b02ceb6
Revises: 7f12d5a2f255
Create Date: 2026-09-01 00:00:00.000000

The original `sql/002`-`sql/012` files mixed CREATE TABLE with seed data,
but only their DDL got folded into d000f529b124 (initial schema) when the
project switched to Alembic — none of their INSERT statements were carried
over. That's invisible in dev (every dev DB was bootstrapped by hand before
the switch) but means a genuinely fresh database — e.g. a new prod Postgres
volume — ends up with the full schema and zero rows: no roles, no RBAC
matrix, no permissions catalog, no reference data, no super admin to log in
with. This migration is the missing seed step, verbatim from those files'
INSERT blocks (`ON CONFLICT DO NOTHING`, safe to run alongside any dev DB
that already has this data).

Order matters: roles before role_permissions (FK), currencies/languages
before the admin user (FK on preferred_currency/preferred_language).
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '976a4b02ceb6'
down_revision: Union[str, None] = '7f12d5a2f255'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # pgcrypto — gen_random_uuid() defaults already rely on it (created
    # implicitly on most managed Postgres), but crypt()/gen_salt() below need
    # it declared explicitly on a bare fresh instance.
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    # ---- roles (sql/002_roles.sql) -----------------------------------
    op.execute("""
        INSERT INTO roles (name, display_name, description, level, is_system, status) VALUES
            ('super_admin',    'Super Administrator', 'Full system access and control',        100, TRUE,  'active'),
            ('admin',          'Administrator',       'Day-to-day operations and management',  80,  TRUE,  'active'),
            ('manager',        'Manager',             'Manages properties, bookings, guests',  70,  TRUE,  'active'),
            ('content_editor', 'Content Editor',      'Owns blog posts, pages and menus',      60,  TRUE,  'active'),
            ('support',        'Support Agent',       'Customer support and ticket management', 50,  TRUE,  'active'),
            ('partner',        'Property Agent',      'Manage their properties and bookings',  40,  TRUE,  'active'),
            ('traveler',       'Traveler',            'Customer with a booking account',       20,  FALSE, 'active')
        ON CONFLICT (name) DO NOTHING
    """)

    # ---- role_permissions (sql/003_role_permissions.sql) --------------
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, m.module, a.action
        FROM roles r
        CROSS JOIN (VALUES
            ('dashboard'), ('properties'), ('bookings'), ('guests'), ('modules'),
            ('cms'), ('blog'), ('reports'), ('payments'), ('settings'), ('roles')
        ) AS m(module)
        CROSS JOIN (VALUES ('view'), ('create'), ('edit'), ('delete')) AS a(action)
        WHERE r.name = 'super_admin'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, m.module, a.action
        FROM roles r
        CROSS JOIN (VALUES
            ('dashboard'), ('properties'), ('bookings'), ('guests'), ('modules'),
            ('cms'), ('blog'), ('reports'), ('payments'), ('settings')
        ) AS m(module)
        CROSS JOIN (VALUES ('view'), ('create'), ('edit'), ('delete')) AS a(action)
        WHERE r.name = 'admin'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, 'roles', 'view'
        FROM roles r
        WHERE r.name = 'admin'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, v.module, v.action
        FROM roles r
        CROSS JOIN (VALUES
            ('dashboard','view'),
            ('properties','view'), ('properties','create'), ('properties','edit'),
            ('bookings','view'),  ('bookings','create'),  ('bookings','edit'),
            ('guests','view'),    ('guests','create'),    ('guests','edit')
        ) AS v(module, action)
        WHERE r.name = 'manager'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, v.module, v.action
        FROM roles r
        CROSS JOIN (VALUES
            ('dashboard','view'),
            ('cms','view'), ('cms','create'), ('cms','edit'), ('cms','delete'),
            ('blog','view'), ('blog','create'), ('blog','edit'), ('blog','delete')
        ) AS v(module, action)
        WHERE r.name = 'content_editor'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)
    op.execute("""
        INSERT INTO role_permissions (role_id, module, action)
        SELECT r.id, v.module, v.action
        FROM roles r
        CROSS JOIN (VALUES
            ('dashboard','view'),
            ('bookings','view'),
            ('guests','view')
        ) AS v(module, action)
        WHERE r.name = 'support'
        ON CONFLICT (role_id, module, action) DO NOTHING
    """)

    # ---- permissions catalog (sql/004_permissions.sql) -----------------
    op.execute("""
        INSERT INTO permissions (name, resource, action, description)
        SELECT a.action || '_' || m.resource,
               m.resource,
               a.action,
               a.label || ' ' || m.label
        FROM (VALUES
            ('dashboard',  'Dashboard'),
            ('properties', 'Properties'),
            ('bookings',   'Bookings'),
            ('guests',     'Guests'),
            ('modules',    'Integrations'),
            ('cms',        'CMS'),
            ('blog',       'Blog'),
            ('reports',    'Reports'),
            ('payments',   'Payments'),
            ('settings',   'Settings'),
            ('roles',      'Roles & Permissions')
        ) AS m(resource, label)
        CROSS JOIN (VALUES
            ('view',   'View'),
            ('create', 'Create'),
            ('edit',   'Update'),
            ('delete', 'Delete')
        ) AS a(action, label)
        ON CONFLICT (name) DO NOTHING
    """)

    # ---- reference data (sql/011_reference_data.sql) -------------------
    op.execute("""
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
        ON CONFLICT (code) DO NOTHING
    """)
    op.execute("""
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
        ON CONFLICT (code) DO NOTHING
    """)
    op.execute("""
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
        ON CONFLICT (code) DO NOTHING
    """)

    # ---- super admin (sql/012_users_seed.sql) --------------------------
    op.execute("""
        INSERT INTO users (
            id, email, password_hash, first_name, last_name, display_name,
            account_type, status, email_verified_at, preferred_currency,
            preferred_language, timezone, country, city
        )
        VALUES (
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'admin@royalvacation.com',
            crypt('admin12345', gen_salt('bf', 12)),
            'Royal', 'Vacation', 'Royal Vacation Admin',
            'admin', 'active', now(), 'AED', 'en', 'Asia/Dubai',
            'United Arab Emirates', 'Dubai'
        )
        ON CONFLICT (email) DO NOTHING
    """)
    op.execute("""
        INSERT INTO user_roles (user_id, role_id, assigned_by)
        SELECT u.id, r.id, u.id
        FROM users u
        JOIN roles r ON r.name = 'super_admin'
        WHERE u.email = 'admin@royalvacation.com'
        ON CONFLICT (user_id, role_id) WHERE is_active DO NOTHING
    """)


def downgrade() -> None:
    # Only unwind the credential-bearing part — the RBAC matrix and
    # reference data are harmless, reusable catalog rows that other seed
    # migrations (e.g. hotels) may already assume are present.
    op.execute("""
        DELETE FROM user_roles
        WHERE user_id = (SELECT id FROM users WHERE email = 'admin@royalvacation.com')
    """)
    op.execute("DELETE FROM users WHERE email = 'admin@royalvacation.com'")

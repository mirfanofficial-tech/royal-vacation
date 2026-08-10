-- Royal Vacation — `users` seed (idempotent)
-- PostgreSQL 16+  |  depends on 001 (users), 002 (roles), 007 (user_roles),
--                      011 (currencies, languages)
--
-- Uses pgcrypto's bcrypt (crypt()/gen_salt('bf')) so the hash is generated
-- inside SQL — compatible with passlib `bcrypt` verification in
-- app/core/security.py. Run from the app for a one-off: the seed script can
-- instead call hash_password() for identical results.
-- Prod seed = minimal (super admin). Full mock-parity dev accounts come with
-- the Phase 3 dev seed.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Super administrator (matches backend demo login)
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
ON CONFLICT (email) DO NOTHING;

-- Link the super admin to the super_admin role.
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT u.id, r.id, u.id
FROM users u
JOIN roles r ON r.name = 'super_admin'
WHERE u.email = 'admin@royalvacation.com'
ON CONFLICT (user_id, role_id) WHERE is_active DO NOTHING;

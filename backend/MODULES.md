# Backend Modules — User Management, Reference Data & Payment Gateways

Documents the tables and API surface built out in this pass: **Authentication**,
**Admin Management** (users / roles / partners / profiles), **Partner** and
**User Profile** self-service, **Reference Data** (currencies / languages /
countries), and **Payment Gateways**. For the original schema design
rationale see [`DATABASE.md`](./DATABASE.md); this file documents what's
actually built and wired up today.

All endpoints are mounted under `API_V1_PREFIX` (default `/api/v1`, see
`app/core/config.py`). Tables live in PostgreSQL, defined in `backend/sql/*.sql`
and mirrored 1:1 by SQLAlchemy models in `backend/app/models/`.

---

## 1. Database schema

### 1.1 `users` — unified account table (travelers, partners, admins)

One table for every account type (`sql/001_users.sql`, `app/models/user.py`).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | login identifier |
| `password_hash` | VARCHAR(255) | nullable — a user with no password can't log in via password |
| `first_name`, `last_name`, `display_name`, `phone`, `profile_picture` | text | |
| `date_of_birth` | DATE | |
| `gender` | VARCHAR(20) | CHECK `male / female / prefer_not_to_say` |
| `account_type` | VARCHAR(20) NOT NULL, default `traveler` | CHECK `traveler / partner / admin` |
| `status` | VARCHAR(20) NOT NULL, default `pending` | CHECK `pending / active / invited / inactive / suspended / deleted` |
| `email_verified_at`, `phone_verified_at` | TIMESTAMPTZ | |
| `two_factor_enabled`, `two_factor_secret` | | not enforced by any route yet |
| `login_attempts`, `locked_until` | | columns exist, not enforced by `auth.py` yet |
| `last_login_at`, `last_ip_address` | | set on successful login |
| `preferred_currency` | CHAR(3) NOT NULL, default `AED` | FK → `currencies.code` (RESTRICT) |
| `preferred_language` | VARCHAR(10) NOT NULL, default `en` | FK → `languages.code` (RESTRICT) |
| `timezone`, `country`, `city`, `address`, `zip_code` | text | `country`/`city` are free text, **not** FK'd to `countries` |
| `invited_by` | UUID | self-FK → `users.id`, `SET NULL` |
| `deleted_at` | TIMESTAMPTZ | soft-delete marker; `DELETE /admin/users/{id}` sets this rather than removing the row |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

### 1.2 `user_sessions` — refresh-token sessions

One row per issued refresh token (`sql/005_user_sessions.sql`).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `user_id` | UUID FK → `users.id` CASCADE | |
| `session_token` | VARCHAR(255) UNIQUE NOT NULL | currently stores the JWT access token string |
| `refresh_token` | VARCHAR(255) UNIQUE | opaque token (`secrets.token_urlsafe`) |
| `device_type`, `device_name`, `browser`, `os`, `ip_address`, `location` | | populated where available |
| `is_active` | BOOLEAN NOT NULL default true | flipped false on logout, password reset, suspend, or refresh rotation |
| `last_activity_at`, `expires_at` | TIMESTAMPTZ | refresh lifetime = `refresh_token_expire_days` (30) |

> **Note:** the original design doc calls for storing *hashes* of session/refresh
> tokens (`005_user_sessions.sql` header comment), not the raw values. The
> current implementation stores raw values — a known gap, not yet hardened.

### 1.3 `user_login_history` / `user_activity_logs` — append-only audit logs

No `updated_at` on either (by design — audit rows never change). Written by
`auth.py` (login attempts) and available via
`GET /admin/users/{id}/sessions|activity`. Nothing currently writes to
`user_activity_logs` — the table and read endpoint exist, but no route calls
`db.add(UserActivityLog(...))` yet.

### 1.4 RBAC — `roles`, `role_permissions`, `permissions`, `user_roles`

| Table | Purpose |
| --- | --- |
| `roles` | `id, name (unique slug), display_name, description, level (int, UI hint only), is_system, status (active/inactive)` |
| `role_permissions` | the actual enforcement matrix: `role_id, module, action` — `module` ∈ `dashboard, properties, bookings, guests, modules, cms, blog, reports, payments, settings, roles`; `action` ∈ `view, create, edit, delete` |
| `permissions` | a documentation/catalog table only (all 11×4 = 44 module/action combos) — **not** read for authorization, just for admin-UI labels |
| `user_roles` | many-to-many `users` ↔ `roles`, with `assigned_by`, `expires_at`, `is_active`. Partial unique index `uq_user_roles_active` ensures one *active* row per (user, role) pair |

**Enforcement today is coarse**: every `admin/*` route is gated by
`require_admin` (any `account_type = 'admin'`), not by the fine-grained
`role_permissions` matrix. The one exception is `DELETE /admin/users/{id}`,
gated by `require_super_admin` (must hold an active `super_admin` role row).
`role_permissions` is fully modeled and readable/writable via the API, and
the *admin frontend* uses it to show/hide UI — but the backend doesn't yet
check it per-request. See `DATABASE.md` §9 Phase 7.

### 1.5 `partner_profiles` / `traveler_profiles` — account-type-specific data

One row per user, `UNIQUE user_id`. `partner_profiles` carries business
details (`business_name`, `tax_id`, `commission_rate`, `is_verified` +
`verified_by`/`verified_at`, `status`: `pending/active/suspended/terminated/rejected`).
`traveler_profiles` carries loyalty data (`loyalty_points`, `loyalty_tier`,
`total_bookings`, `total_spent` — all cached counters, nothing currently
increments them) plus travel preferences.

> **Gap:** there is no endpoint that *creates* a `partner_profiles` or
> `traveler_profiles` row. `POST /auth/register` only creates the `users`
> row. A partner who registers has no profile until one is manually inserted
> — `GET /partner/profile` will 404 for them today.

### 1.6 Reference data — `currencies`, `languages`, `countries`

Lookup tables, each `id UUID PK, code (unique), ..., is_active`.

| Table | Natural key | Extra columns |
| --- | --- | --- |
| `currencies` | `code` CHAR(3), e.g. `AED` | `symbol`, `name`, `rate_to_aed NUMERIC(14,6)` (CHECK `> 0`) |
| `languages` | `code` VARCHAR(10), e.g. `en` | `name`, `native_name` |
| `countries` | `code` CHAR(2), e.g. `AE` | `name`, `dial_code` |

Seeded via `sql/011_reference_data.sql` (20 currencies, 14 languages, 30
countries). `users.preferred_currency`/`preferred_language` are hard FKs
(`RESTRICT`) into these tables — deleting a currency/language still in use
by any user fails at the DB level (translated to a clean `409`, see §2.5).
`countries` has no FK dependents anywhere in the schema.

### 1.7 `payment_gateways` — admin-configured payment providers

New table, `sql/013_payment_gateways.sql`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `code` | TEXT UNIQUE NOT NULL | slug, e.g. `stripe` |
| `name`, `description` | text | |
| `status` | TEXT NOT NULL, default `test` | CHECK `active / test / inactive` |
| `is_default` | BOOLEAN NOT NULL, default false | partial unique index `uq_payment_gateways_default WHERE is_default` — **only one row can be true** |
| `currencies` | JSONB NOT NULL, default `[]` | loose tag list of currency codes, **not** FK-constrained (same pattern as `partner_profiles.preferred_airlines`) |
| `credentials_encrypted` | TEXT | Fernet-encrypted JSON blob — see §3 |
| `success_url`, `cancel_url`, `webhook_url` | TEXT | |
| `created_at`, `updated_at` | TIMESTAMPTZ | |

Seeded with 6 demo gateways (Checkout.com as default, Stripe, Tap Payments,
PayPal, mada, Paytabs) carrying realistic-looking **sandbox** credentials so
the admin UI is testable out of the box. No table anywhere references
`payment_gateways` yet (no `bookings`/`payment_transactions` tables exist) —
this is admin-configuration-only for now.

---

## 2. API modules

### 2.1 Authentication — `/api/v1/auth/*` (public)

`app/api/routes/auth.py`. DB-backed (issues real `users` rows and
`user_sessions` rows — not the in-memory demo store this replaced).

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/register` | Create a `users` row (`account_type` limited to `traveler`/`partner`), issue tokens, return a dev-only email-verification token |
| POST | `/login` | Verify password, issue access + refresh token pair, log the attempt to `user_login_history` |
| POST | `/logout` | Deactivate the `user_sessions` row matching the given refresh token |
| POST | `/refresh-token` | Rotate access + refresh token for an active, unexpired session |
| POST | `/verify-email` | Consume a signed purpose-token, set `email_verified_at`, flip `pending` → `active` |
| POST | `/reset-password` | Issue a signed password-reset token (dev-only: returned in the response body — no email delivery is wired up) |
| POST | `/confirm-reset` | Consume the reset token, set a new password, revoke all active sessions |
| GET | `/me` | Current user, from the bearer token |

**Tokens**: access tokens are short-lived JWTs (`access_token_expire_minutes`,
default 60). Refresh tokens are opaque random strings stored in
`user_sessions`, valid `refresh_token_expire_days` (default 30). Email
verification / password reset use a *separate* signed-JWT scheme (`purpose`
claim, `app/core/security.py`) — stateless, no DB row, short expiry.

### 2.2 Admin management — `/api/v1/admin/*` (requires `account_type = admin`)

Split by sub-resource under `app/api/routes/admin/`.

**Users** (`users.py`) — full CRUD over any account, plus:
`POST /{id}/suspend`, `POST /{id}/activate` (both revoke active sessions on
suspend), `PUT /{id}/roles` (replaces all active `user_roles` rows),
`GET /{id}/sessions`, `GET /{id}/activity`. `DELETE` requires
`require_super_admin`, not just `require_admin`.

**Roles** (`roles.py`) — CRUD over `roles`, plus
`GET`/`PUT /{id}/permissions` to read/replace a role's `role_permissions` rows.

**Partners** (`partners.py`) — `GET ""` lists every `account_type=partner`
user LEFT JOINed with their `partner_profiles` row (so partners with no
profile yet still show up, with `partner_profile_id: null`).
`POST /{user_id}/verify` sets `is_verified=true`, `verified_by`, `verified_at`.

**Profiles** (`profiles.py`) — admin can view/edit *any* user's partner or
traveler profile by user id (`GET`/`PATCH /partners/{user_id}`,
`GET`/`PATCH /travelers/{user_id}`).

**Reference data** (`reference.py`) — three near-identical CRUD routers
(currencies/languages/countries). `GET ""` returns **all** rows including
inactive ones (unlike the public endpoint). `DELETE` catches the DB's
`IntegrityError` from the `users` FK and returns a `409` telling the admin to
deactivate instead of crashing with a `500`.

**Payment gateways** (`payment_gateways.py`) — CRUD plus
`POST /{id}/set-default`. See §3 for the credential encryption/masking model.

### 2.3 Partner self-service — `/api/v1/partner/*` (requires `account_type = partner`)

`GET`/`PUT /profile` operate on the caller's own `partner_profiles` row only
(never another partner's). `GET`/`POST /properties` and `GET /bookings`
return **`501 Not Implemented`** — there's no `bookings` table and the
in-memory property catalog (`GET /api/v1/properties`) has no partner-ownership
column, so these can't be wired up honestly yet.

### 2.4 User profile self-service — `/api/v1/profile/*` (any authenticated user)

`GET`/`PUT ""` (own profile fields — not `password`/`status`),
`POST /change-password` (requires current password, revokes other sessions),
`PUT /preferences` (currency/language/timezone). `GET /bookings` is another
`501` stub — same reason as above.

### 2.5 Public — `/api/v1/reference/*`, `/api/v1/properties`, `/api/v1/health`

Unauthenticated. Reference-data routes return only `is_active=true` rows,
ordered for display (`currencies`/`languages` by code, `countries` by name).
`properties` is still the original in-memory demo catalog, untouched by
today's work.

---

## 3. Payment credential security model

Credentials (`public_key`, `secret_key`, `merchant_id`, `webhook_secret`) are
merged into one dict and encrypted together with **Fernet** (symmetric,
`app/core/crypto.py`), keyed by `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` — a
dedicated setting, deliberately separate from the JWT `SECRET_KEY`.

- **Write**: `POST`/`PATCH` accept a `credentials` object; on update, any
  field left `null`/omitted keeps its previously-stored value (decrypt →
  shallow-merge → re-encrypt). This is how "leave blank to keep the current
  secret" works in the admin UI.
- **Read**: `secret_key`/`webhook_secret` are **never** returned in full —
  only a masked preview (`••••••1234`, last 4 characters). `public_key`/
  `merchant_id` return in full (identifiers, not secrets). There is no
  "reveal" endpoint anywhere — rotating a secret means setting a new one.

This mirrors how Stripe/GitHub/AWS handle API keys (create or rotate, never
re-view).

---

## 4. Known gaps (intentional, not oversights)

- **No booking system** — `bookings`, `payment_transactions`, etc. don't
  exist yet, so `partner`/`profile` booking endpoints and any real payment
  processing are `501` stubs until that's built.
- **`role_permissions` isn't enforced server-side** — only `require_admin`
  (account type) and `require_super_admin` (role) gate `admin/*` today;
  the fine-grained matrix drives the admin *frontend's* UI only.
- **No profile auto-creation on register** — a partner/traveler has no
  `partner_profiles`/`traveler_profiles` row until one exists; nothing
  creates it automatically today.
- **Session tokens stored raw**, not hashed, despite `user_sessions`'
  original design intent (see §1.2 note).
- **Properties catalog has no partner-ownership column** and is still
  in-memory (not a DB table) — blocks `partner/properties` from being real.

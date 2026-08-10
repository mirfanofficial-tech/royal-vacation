# Royal Vacation — Database Plan

Planning document for the production database behind the FastAPI backend
(`backend/`) that currently runs on in-memory data (`app/db/memory.py`).

Goal: define the complete schema, then build it as SQLAlchemy 2.0 models +
Alembic migrations and replace the mock stores (client `src/lib/*mock-data.ts`,
admin `src/lib/mock-data.ts`) with real API data.

---

## 1. Stack decision

| Concern          | Choice                                             |
| ---------------- | -------------------------------------------------- |
| Primary DB       | **PostgreSQL 16** (Docker in dev; Neon/Supabase/RDS in prod) |
| ORM              | SQLAlchemy 2.0 (async)                             |
| Driver           | `asyncpg`                                          |
| Migrations       | Alembic                                            |
| Money            | `NUMERIC(14, 2)` (AED, no floats)                  |
| Time             | `TIMESTAMPTZ`, always UTC; render in client TZ     |
| IDs              | `UUID` (`gen_random_uuid()` via `pgcrypto`), plus human refs (`booking_no`) |
| Optional later   | Redis (sessions/cache), Postgres FTS or Meilisearch, PostGIS (map search) |

Why Postgres: transactional integrity for money + availability (no double
bookings), native window functions for the admin reports (occupancy, revenue,
ADR), mature Python tooling, and free managed tiers.

---

## 2. Conventions

- Tables: `snake_case`, plural. Columns: `snake_case`.
- Every table gets `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (core since PG 13).
- Every table gets `created_at` + `updated_at` (`TIMESTAMPTZ`, default `now()`); `updated_at` auto-bumped by a shared `set_updated_at()` trigger (see `sql/001_users.sql`).
- Soft-delete via `deleted_at` on `users` (unified table), blog posts, properties.
- Money columns: `NUMERIC(14, 2)` with `CHECK (col >= 0)` where sensible.
- Enum-ish values: **CHECK constraints** (`CHECK (col IN (...))`), not native PG ENUM — cheap to alter, introspectable, no `ALTER TYPE` limits.
- FKs: `ON DELETE RESTRICT` for financial/historical rows; `CASCADE` for owned children; `SET NULL` for audit hooks (`invited_by`, `role_id`).
- Human-readable refs stored alongside UUID: `booking_no` (`RV-88421`), `invoice_no` (`INV-2026-0412`).
- DDL lives in `backend/sql/NNN_name.sql` (hand-written, reviewable); SQLAlchemy models + Alembic in Phase 1 stay in sync with these.

---

## 3. Schema — tables

### 3.1 Identity & access (unified users + RBAC)

**`users`** — one table for travelers, partners and admins (see `sql/001_users.sql`). Roles are many-to-many via `user_roles` (007) — no `role_id` here.
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE NOT NULL | store lowercase |
| password_hash | VARCHAR(255) | NULL = invited / social-only |
| first_name / last_name / display_name | VARCHAR | first+last from guest form; display falls back to name |
| phone | VARCHAR(50) | not unique |
| profile_picture | VARCHAR(500) | URL |
| date_of_birth / gender | DATE / VARCHAR(20) | gender check: male/female/prefer_not_to_say |
| account_type | VARCHAR(20) NOT NULL DEFAULT 'traveler' | check: traveler/partner/admin |
| status | VARCHAR(20) NOT NULL DEFAULT 'pending' | check: pending/active/invited/inactive/suspended/deleted |
| email_verified_at / phone_verified_at | TIMESTAMPTZ | verification timestamps |
| two_factor_enabled / two_factor_secret | BOOLEAN / VARCHAR | |
| login_attempts / locked_until | INT / TIMESTAMPTZ | lockout |
| last_login_at / last_ip_address | TIMESTAMPTZ / INET | |
| preferred_currency | CHAR(3) DEFAULT 'AED' FK → `currencies(code)` | |
| preferred_language | VARCHAR(10) DEFAULT 'en' FK → `languages(code)` | |
| timezone | VARCHAR(50) DEFAULT 'Asia/Dubai' | |
| country / city / address / zip_code | VARCHAR / TEXT | free-text snapshot |
| invited_by | UUID FK → `users` SET NULL | admin invite trail |
| created_at / updated_at / deleted_at | TIMESTAMPTZ | soft delete |

Indexes: unique(email); `(account_type, status)`; `(created_at)`.

**`user_roles`** — users ↔ roles junction, many-to-many (see `sql/007_user_roles.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` CASCADE NOT NULL | |
| role_id | UUID FK → `roles` CASCADE NOT NULL | |
| assigned_by | UUID FK → `users` SET NULL | NULL = self/system-assigned |
| assigned_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |
| expires_at | TIMESTAMPTZ | NULL = no expiry; check: > assigned_at |
| is_active | BOOLEAN NOT NULL DEFAULT true | deactivated rows kept for history |

Indexes: `(user_id)`, `(role_id)`, partial unique `(user_id, role_id) WHERE is_active` (one active assignment per pair).

**`partner_profiles`** — partner business profile (see `sql/009_partner_profiles.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` CASCADE NOT NULL UNIQUE | one profile per partner |
| business_name | VARCHAR(255) NOT NULL | |
| business_registration_number | VARCHAR(100) UNIQUE | nullable |
| tax_id / website / business_phone / business_email | VARCHAR | |
| business_license_url / logo_url | VARCHAR(500) | |
| business_address / business_city / business_country | TEXT / VARCHAR | |
| is_verified | BOOLEAN NOT NULL DEFAULT false | |
| verification_documents | JSONB | `[{type, url, uploaded_at}]` |
| verification_notes | TEXT | |
| verified_by | UUID FK → `users` SET NULL | |
| verified_at | TIMESTAMPTZ | |
| commission_rate | NUMERIC(5,2) NOT NULL DEFAULT 10.00 | percentage, check 0–100 |
| payment_terms | VARCHAR(20) | check: weekly/biweekly/monthly |
| auto_confirm_bookings | BOOLEAN NOT NULL DEFAULT true | |
| max_cancellation_days | INT NOT NULL DEFAULT 7 | check >= 0 |
| status | VARCHAR(20) | check: pending/active/suspended/terminated/rejected |
| created_at / updated_at | TIMESTAMPTZ | |

Bank/payout details → future `partner_bank_accounts` table.

**`traveler_profiles`** — traveler account profile (see `sql/010_traveler_profiles.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` CASCADE NOT NULL UNIQUE | one profile per traveler |
| loyalty_points | INT NOT NULL DEFAULT 0 | cached counter |
| loyalty_tier | VARCHAR(20) | check: bronze/silver/gold/platinum |
| total_bookings / total_spent | INT / NUMERIC(14,2) | cached counters, AED |
| preferred_room_type / preferred_meal_plan | VARCHAR | |
| passport_number / passport_expiry | VARCHAR(50) / DATE | optional |
| nationality | VARCHAR(100) | |
| emergency_contact_name / phone | VARCHAR | |
| preferred_airlines / preferred_hotels | JSONB | ID arrays |
| special_requests | TEXT | |
| newsletter_subscribed | BOOLEAN NOT NULL DEFAULT true | |
| marketing_consent_given / marketing_consent_given_at | BOOLEAN / TIMESTAMPTZ | consent requires timestamp (CHECK) |
| created_at / updated_at | TIMESTAMPTZ | |

Counters are maintained transactionally with booking/payment writes.

**`user_sessions`** — auth sessions (see `sql/005_user_sessions.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` CASCADE NOT NULL | |
| session_token / refresh_token | VARCHAR(255) UNIQUE | store SHA-256 hashes, lookup by hash |
| device_type | VARCHAR(20) | check: desktop/mobile/tablet/other |
| device_name / browser / os | VARCHAR | |
| ip_address | INET | |
| location | VARCHAR(255) | geocoded from IP |
| is_active | BOOLEAN NOT NULL DEFAULT true | revoke-all-devices via `UPDATE ... SET is_active = false` |
| last_activity_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ NOT NULL | check: > created_at |
| created_at / updated_at | TIMESTAMPTZ | |

Indexes: `(user_id)`; partial `(user_id) WHERE is_active`; `(expires_at)`.

**`user_login_history`** — append-only auth audit log (see `sql/006_user_login_history.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` CASCADE | NULL if email matched no user |
| email | VARCHAR(255) | attempted identifier, always set |
| login_type | VARCHAR(20) | check: email/google/apple/facebook/phone/token |
| ip_address | INET | |
| user_agent / location | TEXT / VARCHAR | |
| status | VARCHAR(20) | check: success/failed/locked |
| failure_reason | TEXT | |
| created_at | TIMESTAMPTZ | no updated_at — append-only |

Indexes: `(user_id)`; `(created_at)`; partial `(email) WHERE status IN ('failed','locked')` for the lockout rule.

**`user_activity_logs`** — append-only action audit trail (see `sql/008_user_activity_logs.sql`)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| user_id | UUID FK → `users` SET NULL | NULL after user deletion / system actor |
| session_id | UUID FK → `user_sessions` SET NULL | trace action → session |
| action | VARCHAR(100) NOT NULL | free-form `verb_noun`: booking_created, user_updated |
| resource_type / resource_id | VARCHAR(50) / UUID | polymorphic, no FK |
| details | JSONB | request/response context |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | append-only |

Indexes: `(user_id, created_at)`, `(created_at)`, `(resource_type, resource_id)`.

**`roles`** — see `sql/002_roles.sql`
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| name | VARCHAR(50) UNIQUE NOT NULL | stable code: `super_admin, admin, manager, content_editor, support, partner, traveler` |
| display_name | VARCHAR(100) NOT NULL | human label: `Super Administrator` |
| description | TEXT | |
| level | INT NOT NULL | hierarchy hint for UI ordering — NOT an enforcement mechanism |
| is_system | BOOLEAN DEFAULT false | system roles protected from edit/delete |
| status | VARCHAR(20) | check: active/inactive |
| created_at / updated_at | TIMESTAMPTZ | |

Seeded idempotently (`ON CONFLICT (name) DO NOTHING`): super_admin(100), admin(80), manager(70), content_editor(60), support(50), partner(40), traveler(20).

**`role_permissions`** — one row per (role, module, action) — see `sql/003_role_permissions.sql`
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| role_id | UUID FK → `roles` CASCADE | |
| module | VARCHAR(30) NOT NULL | check: dashboard, properties, bookings, guests, modules, cms, blog, reports, payments, settings, roles |
| action | VARCHAR(20) | check: view/create/edit/delete |
| created_at | TIMESTAMPTZ | |
| UNIQUE (role_id, module, action) | | |

"Manage" a resource = role has all four actions (derived, never stored). Seeds for super_admin, admin, manager, content_editor, support match the admin mock matrix; partner/traveler start empty.

**`permissions`** — definition catalog, **not** an enforcement table (see `sql/004_permissions.sql`). Read-only registry of the full 11-module × 4-action cross product (`view_properties`, `delete_bookings`, …) for admin UI labels, audits and docs. Authorization always goes through `role_permissions`.

### 3.2 Catalog

**`properties`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| name | TEXT NOT NULL | |
| slug | TEXT NOT NULL UNIQUE | |
| description | TEXT | |
| star_rating | SMALLINT CHECK 1..5 | |
| brand | TEXT | e.g. Raffles, Atlantis |
| city_id | UUID FK → `cities` | |
| country_id | UUID FK → `countries` | |
| address | TEXT | |
| latitude / longitude | DOUBLE PRECISION | |
| check_in_time / check_out_time | TIME | |
| cancellation_policy | TEXT | |
| base_currency | CHAR(3) DEFAULT 'AED' | |
| status | enum `property_status` | `active / draft / archived` |
| featured | BOOLEAN DEFAULT false | |

**`property_images`** — owned by property, `sort_order`, `alt_text`, `url`.

**`property_amenities`** — `property_id`, `name`, `icon` (from admin CMS list).

**`cities`**, **`countries`**, **`languages`**, **`currencies`** — reference data (see `sql/011_reference_data.sql`).
- `currencies`: UUID PK, `code CHAR(3) UNIQUE` (FK target for `users`), `symbol`, `name`, `rate_to_aed NUMERIC(14,6)` (1 unit in AED, updated by scheduler), `is_active`.
- `countries`: UUID PK, `code CHAR(2) UNIQUE` (ISO 3166-1), `name`, `dial_code` (no `+`), `is_active`.
- `languages`: UUID PK, `code VARCHAR(10) UNIQUE` (BCP-47, allows `zh-Hant`), `name`, `native_name`, `is_active`.

**`rooms`** — room *types* under a property (client renders one card per type)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| property_id | UUID FK → `properties` CASCADE | |
| name | TEXT NOT NULL | e.g. Deluxe King |
| description | TEXT | |
| max_occupancy | SMALLINT | |
| bed_type | TEXT | King / Twin / Suite |
| size_sqm | SMALLINT | |
| base_price | NUMERIC(14,2) | fallback when no rate row |
| images | JSONB | |
| amenities | JSONB | |

**`room_inventory`** — per-day price + availability (the heart of the booking engine)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| room_id | UUID FK → `rooms` CASCADE | |
| date | DATE NOT NULL | |
| price | NUMERIC(14,2) NOT NULL | |
| available_units | INT NOT NULL CHECK (>= 0) | |
| min_stay / max_stay | INT | |
| closed_to_arrival / closed_to_departure | BOOLEAN | |
| UNIQUE (room_id, date) | | |

**`reviews`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| property_id | UUID FK → `properties` | |
| booking_id | UUID FK → `bookings` | unique per booking |
| guest_id | UUID FK → `guests` | |
| rating | SMALLINT CHECK 1..5 | |
| title / body | TEXT | |
| admin_response | TEXT | |
| status | enum `review_status` | `pending / approved / rejected` |

### 3.3 Bookings

**`bookings`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| booking_no | TEXT NOT NULL UNIQUE | `RV-88421` |
| guest_id | UUID FK → `guests` | |
| property_id | UUID FK → `properties` | |
| status | enum `booking_status` | `pending / confirmed / checked_in / checked_out / cancelled / no_show` |
| check_in / check_out | DATE NOT NULL | |
| nights | INT GENERATED or computed | |
| adults / children | SMALLINT | |
| channel_id | UUID FK → `channels` | website / amadeus / expedia / booking.com |
| source | TEXT | device/utm |
| currency | CHAR(3) DEFAULT 'AED' | |
| subtotal / taxes / fees / total | NUMERIC(14,2) | |
| special_requests | TEXT | |
| cancelled_at / cancellation_reason | | |

**`booking_rooms`** — line-item snapshot (price fixed at booking time)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| booking_id | UUID FK → `bookings` CASCADE | |
| room_id | UUID FK → `rooms` | |
| check_in / check_out | DATE | |
| price_per_night | NUMERIC(14,2) | snapshot |
| quantity | SMALLINT DEFAULT 1 | |
| nights | INT | |

**`booking_status_history`** — audit trail
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| booking_id | UUID FK → `bookings` CASCADE | |
| from_status / to_status | enum `booking_status` | |
| note | TEXT | |
| changed_by | UUID FK → `admin_users` NULL | |
| changed_at | TIMESTAMPTZ | |

**`booking_guests`** — travellers on a booking (name, email, phone, nationality).

### 3.4 Payments, finance & payouts

**`payment_transactions`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| booking_id | UUID FK → `bookings` | |
| gateway_id | UUID FK → `payment_gateways` | |
| method | TEXT | Visa / Mastercard / Apple Pay / Bank transfer / Cash |
| amount / fee / net | NUMERIC(14,2) | net = amount − fee |
| currency | CHAR(3) DEFAULT 'AED' | |
| status | enum `txn_status` | `paid / pending / failed / refunded` |
| provider_ref | TEXT | gateway reference |
| captured_at | TIMESTAMPTZ | |

**`invoices`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| invoice_no | TEXT UNIQUE | |
| booking_id | UUID FK → `bookings` | |
| issue_date / due_date | DATE | |
| subtotal / tax / total | NUMERIC(14,2) | |
| status | enum `invoice_status` | `paid / sent / draft / overdue` |

**`refunds`**
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| transaction_id | UUID FK → `payment_transactions` | |
| booking_id | UUID FK → `bookings` | |
| amount | NUMERIC(14,2) | |
| reason | TEXT | |
| status | enum `refund_status` | `pending / processing / completed / failed` |
| initiated_by | UUID FK → `admin_users` | |
| requested_at / completed_at | TIMESTAMPTZ | |

**`payouts`** — settlements to bank accounts / partners
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| recipient | TEXT NOT NULL | bank / partner name |
| method | TEXT | |
| amount | NUMERIC(14,2) | |
| status | enum `payout_status` | `scheduled / processing / paid / failed` |
| scheduled_date / paid_date | DATE | |
| failure_reason | TEXT | |

**`module_commissions`** — owed to Amadeus / Expedia / Booking.com
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| channel_id | UUID FK → `channels` | |
| booking_id | UUID FK → `bookings` | |
| gross | NUMERIC(14,2) | |
| commission_rate | NUMERIC(6,4) | e.g. 0.125 |
| commission | NUMERIC(14,2) | |
| due_date | DATE | |
| status | enum `commission_status` | `pending / paid / failed` |

**`payment_gateways`** — config (admin settings)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| code / name | TEXT | stripe / cardconnect / cash |
| credentials | JSONB | encrypted |
| fee_rate | NUMERIC(6,4) | |
| status | enum `gateway_status` | `active / disabled` |

**`channels`** — booking origin (Website / Amadeus / Expedia / Booking.com)
| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| code | TEXT UNIQUE | `website, amadeus, expedia, bookingdotcom` |
| name | TEXT | |
| type | enum `channel_type` | `direct / ota / api` |
| commission_rate | NUMERIC(6,4) | |
| config | JSONB | module settings |
| status | enum `channel_status` | `active / disabled` |

### 3.5 CMS & blog

- **`cms_pages`** — `slug UNIQUE`, `title`, `content` (markdown/JSON blocks), `status` (`published/draft`), `published_at`.
- **`cms_menus`** — `name`, `location`, `status`; **`menu_items`** — `menu_id FK`, `parent_id`, `label`, `url`, `sort_order`.
- **`blog_categories`** — `name`, `slug UNIQUE`.
- **`blog_posts`** — `title`, `slug UNIQUE`, `excerpt`, `content`, `cover_image`, `author_id FK → users` (admin), `category_id FK`, `status` (`published/draft`), `published_at`, `deleted_at`.

### 3.6 Settings

**`app_settings`** — key/value (`key TEXT PK`, `value JSONB`) for general site settings (default currency, language, favicon, etc.). Tables `currencies` / `languages` / `countries` / `payment_gateways` cover the admin Settings pages.

---

## 4. Key decisions

1. **Availability engine** = `room_inventory` rows + booking overlap checks. On booking confirm, decrement `available_units` for each night (or compute overlap via SQL in a transaction with `SELECT ... FOR UPDATE`).
2. **Prices snapshot** into `booking_rooms`; later rate changes never rewrite past bookings.
3. **Money stays in AED** (`NUMERIC(14,2)`). Multi-currency display uses `currencies.rate_to_aed`; totals always persisted in AED.
4. **RBAC mirrors admin mock**: 11 modules × 4 actions, normalized in `role_permissions`. `is_system` roles (Super Admin, Administrator) protected from delete.
5. **Reports run as SQL views/aggregations** (see §7) — no ETL; admin dashboard queries map 1:1.
6. **Admin `id` refs stay opaque UUIDs**; humans get `booking_no` / `invoice_no`.

---

## 5. Enum-ish values (implemented as CHECK constraints)

| Column / table | Values |
| --- | --- |
| `users.gender` | male, female, prefer_not_to_say |
| `users.account_type` | traveler, partner, admin |
| `users.status` | pending, active, invited, inactive, suspended, deleted |
| `roles.status` | active, inactive |
| `role_permissions.action` | view, create, edit, delete |
| `partner_profiles.status` | pending, active, suspended, terminated, rejected |
| `partner_profiles.payment_terms` | weekly, biweekly, monthly |
| `properties.status` | active, draft, archived |
| `rooms.status` | active, inactive |
| `bookings.status` | pending, confirmed, checked_in, checked_out, cancelled, no_show |
| `payment_transactions.status` | paid, pending, failed, refunded |
| `invoices.status` | paid, sent, draft, overdue |
| `refunds.status` | pending, processing, completed, failed |
| `payouts.status` | scheduled, processing, paid, failed |
| `module_commissions.status` | pending, paid, failed |
| `payment_gateways.status` | active, disabled |
| `channels.status` | active, disabled |
| `channels.type` | direct, ota, api |
| `reviews.status` | pending, approved, rejected |
| `content_status` (pages/posts) | published, draft |

---

## 6. Indexes

- `bookings(guest_id)`, `bookings(property_id, check_in)`, `bookings(status)`.
- `booking_rooms(room_id, check_in)`.
- `room_inventory(room_id, date)` (already unique), `room_inventory(date)` for availability queries.
- `payment_transactions(booking_id)`, `payment_transactions(status)`.
- `invoices(status)`, `refunds(booking_id)`.
- `payouts(status, scheduled_date)`.
- `role_permissions(role_id)`.
- Partial index `properties WHERE status = 'active'` for the client catalog.

---

## 7. Analytics views (feed the admin `/reports/*` pages)

- **`v_occupancy_monthly`** — per property/month: booked nights, available nights, occupancy % (`LATERAL`/`GENERATE_SERIES` over `booking_rooms`).
- **`v_revenue_monthly`** — per month: gross revenue, refunds, net (`payment_transactions`).
- **`v_revenue_by_channel`** — revenue + booking count grouped by `channels.code`.
- **`v_booking_lead_time`** — `days_between(created_at, check_in)` buckets.
- **`v_property_revenue`** — ADR / occupied nights per property.

Dashboard KPIs (paid-out 30d, next payout, commissions owed) read `payouts` + `module_commissions` directly.

---

## 8. Seed plan (from existing mock data)

| Target | Source |
| --- | --- |
| `roles`, `role_permissions`, `users` | `admin/src/lib/mock-data.ts` (roles, users, permissions matrix) |
| `cities`, `countries`, `languages`, `currencies` | `admin` settings + `client` search data |
| `properties`, `rooms`, `room_inventory` | `client/src/lib/property-detail-mock-data.ts`, search mock |
| `bookings`, `booking_rooms`, `guests` | `admin` bookings mock + `client` checkout mock |
| `payment_transactions`, `invoices`, `refunds`, `payouts`, `module_commissions` | `admin/src/lib/payments.ts`, `finance.ts`, `payouts.ts` |
| `blog_posts`, `blog_categories`, `cms_*` | `admin` blog/CMS mock |
| `payment_gateways`, `channels`, `app_settings` | `admin` settings + finance channel data |

Seed idempotent (upsert by unique refs) so re-runs don't duplicate. Dev seed = full mock parity; prod seed = minimal (roles, super admin, reference data). `sql/012_users_seed.sql` seeds the super admin (`admin@royalvacation.com` / `admin12345`) — `password_hash` built in-SQL with `pgcrypto` bcrypt (passlib-compatible).

---

## 9. Build roadmap

1. **Phase 0** — ✅ `docker-compose.yml` (Postgres 16 + pgadmin), `.env` `DATABASE_URL` added to config + `.env.example`. Remaining: `docker compose up -d`.
2. **Phase 1** — ✅ `sql/001_users.sql` (unified `users`), `sql/002_roles.sql` (roles + seed), `sql/003_role_permissions.sql` (RBAC matrix + seed), `sql/004_permissions.sql` (definition catalog), `sql/005_user_sessions.sql` (auth sessions), `sql/006_user_login_history.sql` (auth audit log), `sql/007_user_roles.sql` (users ↔ roles junction; `users.role_id` removed), `sql/008_user_activity_logs.sql` (action audit trail), `sql/009_partner_profiles.sql` (partner business profiles), `sql/010_traveler_profiles.sql` (traveler profiles), `sql/011_reference_data.sql` (currencies/languages/countries), `sql/012_users_seed.sql` (super admin, bcrypt via pgcrypto). ✅ SQLAlchemy 2.0 models in `app/models/` (base, reference, rbac, user) mirror all 12 files; async engine/session in `app/db/session.py`; Alembic scaffolding (`alembic.ini`, `env.py`) targets `Base.metadata` — run `alembic revision --autogenerate` once Postgres is up. Next: seed/verify against a live DB.
3. **Phase 2** — ✅ `app/db/session.py` (async engine/session) + DB-backed routers: `users` (CRUD, soft-delete, role assignment, sessions, activity), `roles` (CRUD + permissions), `reference` (currencies/languages/countries, public), `profiles` (partner/traveler). DB-backed auth deps (`get_db_user`, `require_db_admin`) added to `app/api/deps.py`. Remaining: migrate `/auth` + `/properties` off `app/db/memory.py` to the DB (memory still seeds the demo login).
4. **Phase 3** — seeding scripts (`app/db/seed.py`, `scripts/seed.py`) mirroring §8.
5. **Phase 4** — bookings + availability transaction logic (inventory decrement, status history).
6. **Phase 5** — payments/invoices/refunds/payouts endpoints + reconciliation.
7. **Phase 6** — report views (§7) + `/reports/*` API endpoints; wire admin dashboard.
8. **Phase 7** — auth: JWT + argon2 password hashing (`app/core/security.py` exists), refresh tokens, RBAC enforcement from `role_permissions`.

---

## 10. Open questions (decide before building)

- [x] PostgreSQL via **Docker Desktop** on this Windows machine (managed Neon/Supabase later if needed) — `backend/docker-compose.yml` added.
- [x] Unified `users` table (travelers + partners + admins) with nullable `role_id` — replaces separate `admin_users`/`guests`. `sql/001_users.sql` created.
- [x] `roles` settled: `name` slug + `display_name`, `level` as UI hint only, no `guest` role (guests = `role_id NULL`), `traveler` kept for future customer area. `sql/002_roles.sql` created.
- [x] RBAC model: **Option A** — `role_permissions(role_id, module, action)` matrix, no named-permission catalog (admin app is canonical). `sql/003_role_permissions.sql` created.
- [x] Users ↔ roles: **many-to-many** via `user_roles` (dropped `users.role_id`). `sql/007_user_roles.sql` created.
- [ ] UUID vs `BIGINT` identity PKs — plan assumes UUID. Confirm.
- [ ] Soft-delete scope: users, posts, properties only?
- [ ] Availability: decrement inventory on confirm vs compute overlap per request (hybrid recommendation below).
- [ ] Multi-currency: display-only conversion (recommended) vs storing per-currency amounts.

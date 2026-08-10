# Royal Vacation Backend

FastAPI service powering both the customer site (`client`) and the admin panel (`admin`).

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then edit SECRET_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

- API docs (Swagger): http://localhost:8000/docs
- OpenAPI schema: http://localhost:8000/openapi.json (used to generate the TS client types)

## Demo admin credentials

Seeded via `sql/012_users_seed.sql` into the real `users` table (Postgres, not in-memory):

- Email: `admin@royalvacation.com`
- Password: `admin12345`

## Structure

```
backend/
  app/
    main.py            # app factory, CORS, router registration
    core/              # settings + security (JWT, password hashing, purpose tokens)
    schemas/           # Pydantic request/response models
    api/
      deps.py          # auth dependencies (get_current_user, require_admin/super_admin/partner)
      routes/
        common.py      # shared UserOut serialization / role-eager-load helper
        auth.py         # Authentication      — /api/v1/auth/*    (public account lifecycle)
        admin/           # Admin management    — /api/v1/admin/*   (admin-gated)
          users.py         #   user CRUD, suspend/activate, sessions, activity
          partners.py       #   partner listing + verification
          roles.py           #   RBAC roles + permissions
          profiles.py         #   admin view of any user's partner/traveler profile
        partner.py        # Partner management  — /api/v1/partner/* (self-service, partner accounts)
        profile.py         # User profile        — /api/v1/profile/* (self-service, any account)
        properties.py       # Public property catalog (in-memory demo store, unrelated to auth)
        reference.py         # Currencies/languages/countries (public)
        health.py             # Liveness check
    db/                # data access layer — properties only (in-memory placeholder);
                        # everything user-related is DB-backed via app/models + app/db/session.py
```

Each user-management module maps 1:1 onto its own file (or sub-package for `admin`, since it
covers three sub-resources) so an endpoint's owner and access rule are obvious from the import path
alone — no need to grep `main.py` to find where a route lives.

## Conventions

- All business logic lives here; frontends never touch the database.
- Protected endpoints use `Bearer` tokens (`Authorization: Bearer <access_token>`), issued by
  `POST /api/v1/auth/login` and refreshed via `POST /api/v1/auth/refresh-token`.
- Admin routes require `require_admin` (any `account_type == "admin"` user); the single
  hard-delete endpoint (`DELETE /admin/users/{id}`) additionally requires `require_super_admin`
  (an active `super_admin` role assignment, checked via `roles`/`user_roles`).
- Partner routes (`/api/v1/partner/*`) require `require_partner` and only ever touch the calling
  user's own records — never another partner's.
- `/api/v1/partner/properties` and `/api/v1/partner/bookings` / `/api/v1/profile/bookings`
  currently return `501 Not Implemented`: properties are still an in-memory demo store with no
  partner ownership column, and there is no `bookings` table yet. Both need a DB migration before
  they can be wired up for real.
- Keep schemas as the single contract — the TS types in `packages/api-client` mirror them.

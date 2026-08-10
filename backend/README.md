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

Seeded on startup (in-memory only, replace with a real DB before production):

- Email: `admin@royalvacation.com`
- Password: `admin12345`

## Structure

```
backend/
  app/
    main.py            # app factory, CORS, router registration
    core/              # settings + security (JWT, password hashing)
    schemas/           # Pydantic request/response models
    api/
      deps.py          # auth dependencies (current user, admin guard)
      routes/          # health, auth, properties
    db/                # data access layer (in-memory placeholder)
```

## Conventions

- All business logic lives here; frontends never touch the database.
- Protected endpoints use `Bearer` tokens; admin routes additionally require the `admin` role.
- Keep schemas as the single contract — the TS types in `packages/api-client` mirror them.

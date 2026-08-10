"""Generate Alembic revisions.

Targets: `Base.metadata` from `app.models` — run `alembic revision --autogenerate`
after `docker compose up -d` to produce the initial migration from the models
(which mirror `sql/001..012`). The DDL in `backend/sql/` stays the canonical
source of truth; this generates the tracking migration so `alembic upgrade head`
matches the models exactly.
"""

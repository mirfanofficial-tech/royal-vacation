# Royal Vacation API — production image.
# Build from the repo root: docker build -f backend/Dockerfile -t royal-vacation-api .

FROM python:3.11-slim AS builder

# Only needed to compile wheels (cryptography/bcrypt/asyncpg) that don't ship
# a prebuilt wheel for this platform — not present in the final image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


FROM python:3.11-slim AS runner

# libpq5 is the runtime half of libpq-dev — asyncpg/psycopg-style Postgres
# drivers need it even though nothing gets compiled here.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /install /usr/local

COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini .

# Uploaded files (logos, property images, ...) — mount this as a volume in
# docker-compose so it survives container restarts/redeploys.
RUN mkdir -p /app/static/uploads

EXPOSE 8000

# Run pending migrations, then start the API. `--workers` scales with
# available CPU; tune per instance size (t3.micro/small: 2 is plenty).
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2

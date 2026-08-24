# Deploying to the InMotion VPS

Everything runs in Docker: Postgres, the FastAPI backend, the two Next.js
apps, and nginx as the only public-facing reverse proxy. Nothing else is
exposed — the app processes and database have no published ports, matching
the "don't expose source/secrets" requirement from earlier.

## 0. Prerequisites on the VPS

SSH in, then install Docker (InMotion VPS gives root access, so this is a
normal Ubuntu/Debian install):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out/in after this
```

Point your domain's DNS (A records) at the VPS's IP for:
`example.com`, `www.example.com`, `admin.example.com`, `api.example.com`
(swap in your real domain — see step 2).

Open only ports 80 and 443 in the VPS firewall (InMotion's control panel or
`ufw`); nothing else needs to be public.

## 1. Get the code onto the server

```bash
git clone <your-repo-url> royal-vacation
cd royal-vacation
```

Don't `git pull` over uncommitted server-side changes later — treat the VPS
checkout as deploy-only, all real changes go through git.

## 2. Configure

```bash
cp .env.example .env
nano .env   # fill in real values — see .env.example's comments
```

Replace `example.com` / `admin.example.com` / `api.example.com` in
`deploy/nginx.conf` with your real domain(s).

## 3. First boot (HTTP only, before TLS)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This builds all images (first build takes a while — Next.js standalone
builds + the Python image) and starts everything. The backend's entrypoint
runs `alembic upgrade head` automatically on boot.

Check it's actually healthy:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --tail 50
curl http://api.example.com/docs   # should return the FastAPI docs page
```

## 4. Seed reference/demo data (optional, once)

Same seed scripts used in development, run inside the backend container:

```bash
docker compose -f docker-compose.prod.yml exec backend python -m app.db.seed_hotels
```

## 5. Issue TLS certificates

```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com -d www.example.com \
  -d admin.example.com \
  -d api.example.com \
  --email you@example.com --agree-tos --no-eff-email
```

Then in `deploy/nginx.conf`:
1. Uncomment the three `server { listen 443 ssl; ... }` blocks at the
   bottom and fill in your real domain names.
2. Add `return 301 https://$host$request_uri;` as the only thing inside
   each `location /` block in the `listen 80` server blocks, so HTTP
   redirects to HTTPS (keep the `/.well-known/acme-challenge/` location as-is
   for renewals).

Reload nginx to pick up the change:

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Renewal

Certs expire every 90 days. Add a cron job on the host:

```bash
# crontab -e
0 3 * * * cd /path/to/royal-vacation && docker compose -f docker-compose.prod.yml run --rm certbot renew --webroot -w /var/www/certbot && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 6. Deploying updates later

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Docker rebuilds only the images whose context changed; migrations run
automatically on backend restart.

## Why this shape

- **nginx is the only public service.** `db`, `backend`, `client`, `admin`
  have no published ports — reachable only inside the Docker network. This
  is what "don't expose source/secrets" actually means in practice: even if
  someone hits the VPS's IP directly on a random port, there's nothing
  there to hit.
- **Next.js apps run their production server (`node server.js` from
  `output: "standalone"`), never `next dev`.** No source maps, no dev
  server, no way to reach the source tree from the network.
- **Secrets live only in `.env` on the server** (gitignored) and are
  injected as container environment variables — never baked into an image
  layer, never committed.

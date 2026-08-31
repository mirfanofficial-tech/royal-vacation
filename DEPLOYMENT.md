# Deploying Royal Vacation to an EC2 Ubuntu server

Full stack (`client`, `admin`, `backend`, Postgres) as four Docker containers
behind a Caddy reverse proxy that issues its own HTTPS certs. This is the
step-by-step from a bare AWS account to a live site, and the checklist for
every redeploy after that.

Pieces already in the repo that this guide drives:
`backend/Dockerfile`, `client/Dockerfile`, `admin/Dockerfile`,
`docker-compose.prod.yml`, `Caddyfile`, `.env.production.example`.

## 0. Before you start

- An AWS account with permission to launch EC2 instances.
- A domain name you control DNS for (Route 53 or any registrar).
- This repo pushed to GitHub (or wherever you'll `git clone` from) — and if
  it's private, a way to authenticate: a fine-grained GitHub PAT, or an SSH
  deploy key. Either works; step 5 covers both.

## 1. Launch the EC2 instance

AWS Console → EC2 → **Launch instance**.

| Setting | Value |
|---|---|
| Name | `royal-vacation` |
| AMI | **Ubuntu Server 24.04 LTS** (or 22.04 LTS), 64-bit (x86) |
| Instance type | **t3.small** minimum (2GB RAM). Go **t3.medium** (4GB) if you want headroom — three simultaneous Next.js builds inside `docker compose build` is real memory pressure on 2GB; t3.small will work but builds run one at a time and slower. |
| Key pair | Create new, download the `.pem`, keep it — it's the only way in |
| Network settings | Allow SSH (port 22) from **My IP** only, not `0.0.0.0/0`. Allow HTTP (80) and HTTPS (443) from anywhere — needed for Let's Encrypt and for visitors. |
| Storage | **30 GB gp3** minimum. Docker images + build cache + Postgres data add up fast; don't ship this on the default 8GB. |

Launch it. Note the **public IPv4 address** once it's running.

## 2. Allocate an Elastic IP

A plain public IP changes if you ever stop/start the instance, which would
silently break DNS and Let's Encrypt renewals. Do this once, it's free while
attached:

EC2 → **Elastic IPs** → Allocate → Associate with your instance.

Use this Elastic IP for everything below.

## 3. Point DNS at it

At your DNS provider, create three **A records** pointing at the Elastic IP:

```
royalvacation.com        A   <elastic-ip>
www.royalvacation.com    A   <elastic-ip>
admin.royalvacation.com  A   <elastic-ip>
api.royalvacation.com    A   <elastic-ip>
```

(Swap in your real domain.) Caddy (step 8) needs these resolving **before**
it starts, or the automatic HTTPS handshake with Let's Encrypt fails. DNS
propagation can take a few minutes to an hour — check with `dig
royalvacation.com` before moving on if you're unsure.

## 4. SSH in and prep the OS

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<elastic-ip>
```

Once in:

```bash
sudo apt update && sudo apt upgrade -y

# Firewall — only what's actually needed
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Swap file — skip this if you picked t3.medium or larger.
# On a t3.small (2GB RAM), the client/admin `next build` steps can OOM
# without it.
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 5. Install Docker

Ubuntu's own repo Docker package is stale — use Docker's official apt repo:

```bash
# Remove any old/distro docker packages
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Run docker without sudo
sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

## 6. Clone the repo

```bash
sudo apt install -y git

# Public repo:
git clone https://github.com/<your-org>/royal-vacation.git
cd royal-vacation

# Private repo via HTTPS + a fine-grained PAT (Settings → Developer settings
# → Personal access tokens on GitHub — scope it to just this repo, read-only):
git clone https://<your-username>:<your-PAT>@github.com/<your-org>/royal-vacation.git
cd royal-vacation

# Private repo via SSH deploy key instead:
#   ssh-keygen -t ed25519 -C "ec2-deploy" -f ~/.ssh/id_ed25519 -N ""
#   cat ~/.ssh/id_ed25519.pub   # paste into GitHub repo → Settings → Deploy keys (read-only)
#   git clone git@github.com:<your-org>/royal-vacation.git
```

## 7. Configure environment

```bash
cp .env.production.example .env
nano .env   # or vim
```

Fill in every value. Generate the two secrets from your **local machine**
(don't need Python on the server for this, but it's fine either way):

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"        # -> SECRET_KEY
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # -> PAYMENT_CREDENTIALS_ENCRYPTION_KEY
openssl rand -base64 24                                               # -> POSTGRES_PASSWORD
```

Fields to set:

| Variable | Value |
|---|---|
| `DOMAIN` | `royalvacation.com` (bare domain, no protocol) |
| `LETSENCRYPT_EMAIL` | a real address you check — cert expiry warnings go here |
| `POSTGRES_PASSWORD` | from `openssl rand -base64 24` above |
| `SECRET_KEY` | from the `secrets.token_urlsafe(64)` command above |
| `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` | from the `Fernet.generate_key()` command above |
| `CORS_ORIGINS` | `["https://royalvacation.com","https://www.royalvacation.com","https://admin.royalvacation.com"]` |
| `NEXT_PUBLIC_API_URL` | `https://api.royalvacation.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://royalvacation.com` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | your Mapbox public token |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | optional — leave blank to ship without Google sign-in |

`chmod 600 .env` afterwards — it holds real secrets.

## 8. Build and start the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First run builds all four images from scratch (backend wheel compile +
two Next.js production builds) — expect **10-20 minutes** depending on
instance size. Watch it:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

What happens on this first boot, in order:
1. `db` starts, Postgres initializes an empty `royal_vacation` database.
2. `backend` waits for `db`'s healthcheck, then its container `CMD` runs
   `alembic upgrade head` — this creates every table **and** seeds the RBAC
   roles/permissions matrix, currency/language/country reference data, and
   the super-admin login (`admin@royalvacation.com` / `admin12345`) in one
   shot, then starts `uvicorn`.
3. `client` and `admin` start serving their already-built standalone bundles.
4. `caddy` starts last, requests certs from Let's Encrypt for all three
   hostnames (needs the DNS from step 3 already resolving), and starts
   proxying.

## 9. Verify

```bash
docker compose -f docker-compose.prod.yml ps      # all should show healthy/running
```

Then from your own machine:

- `https://royalvacation.com` — client site loads
- `https://admin.royalvacation.com` — admin login page loads
- `https://api.royalvacation.com/docs` — Swagger UI loads
- Log into the admin panel with `admin@royalvacation.com` / `admin12345`
  — **change this password immediately** (Admin → Profile, or via the API)
  once you're in; it's a well-known default seeded by the migration above.

If a hostname doesn't get a cert, check `docker compose logs caddy` — the
most common cause is DNS not pointed at the instance yet, or the security
group not actually allowing 80/443 inbound.

## 10. Redeploying after code changes

```bash
cd royal-vacation
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Compose only rebuilds images whose build context changed, and only recreates
containers whose image changed — `db`'s data volume is untouched. Any new
Alembic revision runs automatically on the backend container's next start,
same as first boot.

## 11. Day-2 operations

**Logs** (one service or all):
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f
```

**Restart one service:**
```bash
docker compose -f docker-compose.prod.yml restart backend
```

**Database backup:**
```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres royal_vacation | gzip > backup-$(date +%F).sql.gz
```
Copy that file off the instance (`scp`) — it's your only copy otherwise.

**Database restore** (into a running `db` container):
```bash
gunzip -c backup-2026-09-01.sql.gz | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U postgres royal_vacation
```

**Shell into a container:**
```bash
docker compose -f docker-compose.prod.yml exec backend sh
docker compose -f docker-compose.prod.yml exec db psql -U postgres royal_vacation
```

**Stop everything** (containers only, volumes/data persist):
```bash
docker compose -f docker-compose.prod.yml down
```

**Full teardown including data** (careful — destroys the database):
```bash
docker compose -f docker-compose.prod.yml down -v
```

## 12. Troubleshooting

- **`docker build` fails with a read-only-filesystem / "error committing"
  error.** This is the disk on the instance being full, not a bug in the
  Dockerfile — `df -h` to check. `docker system prune -af` reclaims space
  from old image layers/build cache if you've redeployed a few times.
- **Caddy never gets a certificate.** Confirm `dig <domain>` resolves to the
  Elastic IP from outside the VPC, and that the security group allows 80/443
  from `0.0.0.0/0` (not just your IP — Let's Encrypt's validators aren't
  you).
- **`backend` container keeps restarting.** `docker compose logs backend` —
  almost always a missing/wrong `.env` value (`DATABASE_URL` is assembled
  from `POSTGRES_PASSWORD` automatically, so a stray quote or space in that
  one variable breaks it) or the `db` healthcheck not passing yet.
- **Out of memory during `up --build` on a t3.small.** Confirm the swapfile
  from step 4 is active (`swapon --show`); build one image at a time instead
  of all four concurrently: `docker compose -f docker-compose.prod.yml build backend && ... build client && ... build admin`.

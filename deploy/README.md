# Production Deploy

This repo is wired for a single Ubuntu 22.04 VPS running:

- User frontend on `hamarsride.com`
- User API on `api.hamarsride.com`
- Admin frontend on `admin.hamarsride.com`
- One shared backend serving both user and admin APIs

## Exact DNS

Point these `A` records to `69.62.106.79`:

- `hamarsride.com` -> `69.62.106.79`
- `www.hamarsride.com` -> `69.62.106.79`
- `api.hamarsride.com` -> `69.62.106.79`
- `admin.hamarsride.com` -> `69.62.106.79`

## VPS bootstrap

Run this as root on the server:

```bash
bash deploy/vps/bootstrap-ubuntu22.sh
```

The script installs:

- Node.js LTS
- Nginx
- PM2
- PostgreSQL
- Git
- UFW
- Certbot

It also:

- Creates a non-root sudo user
- Enables firewall rules for `22`, `80`, and `443`
- Creates the PostgreSQL database and role

## Production config

Copy [deploy/production.env.example] to [deploy/production.env] and fill in the real values.

Required values:

- `DOMAIN`
- `API_DOMAIN`
- `ADMIN_DOMAIN`
- `DATABASE_URL`
- `JWT_SECRET`
- `LE_EMAIL`

## App layout on the VPS

The deploy script wires these paths under `/var/www`:

- `/var/www/hamarsride-user-frontend`
- `/var/www/hamarsride-backend`
- `/var/www/hamarsride-admin-frontend`

## Production deploy

From the repo root on the VPS:

```bash
bash deploy/vps/deploy-production.sh
```

What it does:

- Symlinks the app roots into `/var/www`
- Writes the backend `.env` file
- Writes frontend `.env.production` files
- Installs dependencies
- Runs Prisma generate and migrate deploy
- Builds both React frontends
- Installs the Nginx config
- Starts or reloads PM2
- Requests SSL certificates with Certbot when `LE_EMAIL` is set

The admin frontend is configured to use the same API base as the user app, so it talks to `api.hamarsride.com/api` instead of a separate admin API host.

## PM2

The PM2 ecosystem file uses a single backend:

- User backend on port `5000`

## Nginx

The provided [deploy/nginx.conf.example] template:

- Forces HTTPS
- Proxies APIs
- Serves static frontend builds
- Enables gzip
- Adds security headers
- Uses caching for static assets

## Database

The backend uses the same PostgreSQL instance through `DATABASE_URL`.

The shared backend owns the migration history, so `prisma migrate deploy` runs there during production deploy.

## SSL renewal

Certbot installs auto-renewal. Verify with:

```bash
certbot renew --dry-run
```

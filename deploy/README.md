# Deployment

This workspace contains two separate products:

- User app: `hamarsride-user`
- Admin app: `hamarsride-admin`

Each product has a frontend and a backend.

## Recommended production layout

- User frontend: `https://www.your-domain.com`
- User API: `https://api.your-domain.com`
- Admin frontend: `https://admin.your-domain.com`
- Admin API: `https://admin-api.your-domain.com`

## Build

```powershell
npm run build:user
npm run build:admin
```

## Run backends

Use PM2 or another process manager for the two backends.

The included PM2 file is `deploy/ecosystem.config.cjs`.

## Nginx

Use static hosting for the built frontends and reverse proxy the API hosts to the backend ports.

An example Nginx setup is in `deploy/nginx.conf.example`.

## Environment variables

Set these before starting production services:

- User backend
  - `PORT=5000`
  - `DATABASE_URL=...`
  - `CORS_ORIGINS=https://www.your-domain.com,https://admin.your-domain.com`
  - `GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json`
  - `USER_UPLOADS_DIR=/var/www/hamarsride-user-uploads`
- User frontend
  - `VITE_API_BASE_URL=https://api.your-domain.com/api`
- Admin backend
  - `PORT=5501`
  - `DATABASE_URL=...`
  - `CORS_ORIGINS=https://admin.your-domain.com`
  - `GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json`
  - `ADMIN_UPLOADS_DIR=/var/www/hamarsride-admin-uploads`
- Admin frontend
  - `VITE_API_BASE_URL=https://admin-api.your-domain.com`

## Important note

Rejected orders are now a real order state. The admin must supply a rejection reason, and the user-facing UI should render `rejected` instead of leaving an order stuck on `pending`.

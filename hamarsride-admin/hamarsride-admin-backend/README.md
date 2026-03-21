# HamarsRide Admin Backend

Admin-only API service for dashboard, orders, users, restaurants, payments and notifications.

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Ensure `DATABASE_URL` points to the same DB used by main backend.
3. Ensure Firebase admin credentials are configured.
4. Run:

```bash
npm install
npm run prisma:generate
npm run dev
```

Service runs on `PORT` (default `5501`).

## Promote first admin

```bash
npm run admin:promote -- you@example.com
```

That email must already exist in `User` table.

## Scripts

- `npm run dev`
- `npm run start`
- `npm run check`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run admin:promote -- <email>`

# HamarsRide Admin Frontend

Admin dashboard web app for operations (orders, users, restaurants, payments, notifications).

## Stack

- React 19
- Vite
- Tailwind CSS
- Firebase Auth

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env values (including API proxy target where needed).

3. Start dev server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run lint` - lint checks
- `npm run test` - smoke tests (`node tests/smoke.test.js`)
- `npm run preview` - preview production build

## Notes

- API proxy is configured in `vite.config.js` using `VITE_API_PROXY_TARGET`.
- Feature pages live in `pages/`.


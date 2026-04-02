# HamarsRide Frontend

Rider-facing web app built with React and Vite.

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

2. Create a `.env` file (or use existing local environment values) for frontend variables.

3. Start development server:

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

- API proxy is configured in `vite.config.js` via `VITE_API_PROXY_TARGET`.
- Primary app pages live in `pages/`.


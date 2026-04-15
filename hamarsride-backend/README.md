# HamarsRide Backend

Main API service for customer auth, profiles, restaurants, cart, orders, payments, and notifications.

## Setup

1. Copy `.env.example` to `.env` and set required values.
2. Ensure Firebase Admin credentials are configured.
3. Install dependencies and generate Prisma client:

```bash
npm install
npm run prisma:generate
```

4. Run in development:

```bash
npm run dev
```

Service runs on `PORT` (default defined in env/server config).

## Scripts

- `npm run dev` - run backend server
- `npm run start` - run backend server
- `npm run test` - smoke tests (`node tests/smoke.test.js`)
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrations (dev)
- `npm run prisma:studio` - open Prisma Studio
- `npm run images:prompts` - export standardized AI-image prompts for all restaurant menu items
- `npm run images:generate` - generate images from prompts with OpenAI and write manifest
- `npm run images:apply` - apply generated image URLs to menu items from a manifest file
- `npm run images:run-all` - prompts -> generate images -> apply to DB in one command

## AI Menu Images Workflow

1. Export prompts for all restaurants:

```bash
npm run images:prompts
```

This generates:

- `generated/menu-image-prompts.json` (one prompt per menu item)
- `generated/menu-image-config.json` (recommended style settings)

2. Generate images with your preferred AI tool using those prompts, then prepare a manifest:

Or auto-generate directly from prompts:

```bash
npm run images:generate
```

Provider behavior:

- Uses OpenAI when `OPENAI_API_KEY` is available.
- Falls back to a no-key AI provider when OpenAI key is missing.

```json
{
  "items": [
    {
      "menuItemId": "cm123example",
      "image": "https://your-cdn-or-storage/image-1.jpg"
    }
  ]
}
```

You can copy from `menu-images-manifest.example.json`.

3. Apply image URLs back to the database:

```bash
npm run images:apply -- --input generated/menu-images-manifest.json
```


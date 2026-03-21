# Frontend Integration Checklist

## Admin Frontend

Use these env values in `hamarsride-admin-frontend/.env`:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:5501
```

## Run sequence

1. Start admin backend:

```bash
cd hamarsride-admin/hamarsride-admin-backend
npm run dev
```

2. Start admin frontend:

```bash
cd hamarsride-admin/hamarsride-admin-frontend
npm run dev
```

3. Confirm health:

- `GET http://localhost:5501/health`

4. Login flow:

- Login from admin frontend with Firebase credentials.
- Backend `POST /auth/login` must return a user with `role: "admin"`.

5. If login fails with admin-role error:

```bash
cd hamarsride-admin/hamarsride-admin-backend
npm run admin:promote -- you@example.com
```

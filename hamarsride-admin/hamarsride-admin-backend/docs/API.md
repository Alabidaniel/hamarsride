# Admin Backend API

Base URL: `http://localhost:5501`

All protected endpoints require Firebase ID token:

`Authorization: Bearer <idToken>`

## Public

- `GET /health`
- `POST /auth/login` (returns admin user; rejects non-admin)

## Admin Endpoints

- `GET /admin/overview`
- `GET /admin/orders?status=&userId=&page=&pageSize=`
- `PATCH /admin/orders/:id/status` body: `{ "status": "pending|accepted|picked_up|processing|delivered|cancelled" }`
- `GET /admin/users?q=&role=&page=&pageSize=`
- `GET /admin/restaurants?q=&page=&pageSize=`
- `PATCH /admin/restaurants/:id` body fields: `name,image,rating,time,fee,open`
- `GET /admin/payments?status=&q=&page=&pageSize=`
- `PATCH /admin/payments/:id/status` body: `{ "status": "verified|rejected" }`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/mark-all-read`

## Notes

- All `/admin/*` and `/notifications/*` routes are admin-only.
- Errors are returned as `{ "error": "message" }`.

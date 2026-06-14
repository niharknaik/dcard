# API Architecture

REST, JSON, versioned under `/api/v1`. JWT bearer auth. Clean Architecture layering:

```
Route → Middleware → FormRequest (validation) → Controller (thin)
      → Service (business rules) → Repository (data access) → Model
                                 ↘ Notifications / Jobs / Mail (queued)
Controller → API Resource (response shaping)
```

## Layering rules
- **Controllers** are thin: validate (via FormRequest), call a Service, return a Resource.
- **Services** hold business logic, orchestrate repositories, dispatch jobs/notifications, manage transactions.
- **Repositories** wrap Eloquent queries (testable, swappable). One interface per aggregate.
- **Policies** authorize ownership (`card.user_id === auth id`) and plan/role capability.
- **Resources** shape every JSON response (no raw model leakage).

## Standard response envelope

Success:
```json
{ "success": true, "data": { }, "message": "OK", "meta": { } }
```
Paginated:
```json
{ "success": true, "data": [ ], "meta": { "current_page": 1, "per_page": 15, "total": 120, "last_page": 8 } }
```
Error:
```json
{ "success": false, "message": "Validation failed", "errors": { "email": ["..."] } }
```

HTTP codes: `200` OK, `201` Created, `204` No Content, `401` Unauthenticated,
`403` Forbidden, `404` Not Found, `422` Validation, `429` Rate limited, `500` Server.

## Authentication
- JWT via `php-open-source-saver/jwt-auth`. Access token TTL 60m, refresh TTL 14d.
- `Authorization: Bearer <token>`.
- Guard `api` (driver `jwt`). Refresh endpoint rotates tokens.

## Rate limiting
- `throttle:api` (default 60/min) on authenticated routes.
- `throttle:auth` (10/min) on login/register/forgot-password.
- Public card + lead endpoints throttled per-IP to deter abuse.

## Route map (v1)

### Public (no auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET  | `/api/v1/public/cards/{slug}` | Public card view (+increments views) |
| POST | `/api/v1/public/cards/{slug}/leads` | Submit a lead |
| POST | `/api/v1/public/cards/{slug}/events` | Record analytics event (qr_scan/link_click/...) |
| GET  | `/api/v1/content/pages/{slug}` | Terms/Privacy etc. |
| GET  | `/api/v1/content/faqs` | FAQs |

> Public read endpoints are namespaced under `/public` so `cards/{card}` resource
> routes (authenticated, bound by id) don't collide with `cards/{slug}` (public).

### Auth
| Method | Endpoint |
|--------|----------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/reset-password` |
| GET  | `/api/v1/auth/me` |

### Account (auth)
`PUT /profile`, `PUT /password`, `DELETE /account`

### Cards (auth)
`GET/POST /cards`, `GET/PUT/DELETE /cards/{id}`, `POST /cards/{id}/duplicate`,
`GET /cards/{id}/qr`, nested `social-links`, `portfolio`, `services`.

### Leads (auth)
`GET /cards/{id}/leads`, `GET /leads`, `PATCH /leads/{id}/read`, `GET /leads/export`

### Analytics (auth)
`GET /cards/{id}/analytics`, `GET /analytics/summary?period=daily|weekly|monthly`

### Notifications (auth)
`GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/{id}/read`,
`PATCH /notifications/read-all`, `DELETE /notifications/{id}`

### Subscriptions & Payments (auth)
`GET /plans`, `GET /subscription`, `POST /subscriptions/checkout`,
`POST /payments/verify`, `POST /payments/webhook` (public, signature-verified),
`GET /payments`, `GET /payments/{id}/invoice`

### Team (auth, business plan)
`GET/POST /team/members`, `DELETE /team/members/{id}`, `GET /team/analytics`

## Versioning
Routes grouped by `v1`. Breaking changes ship under `v2` while `v1` is maintained.
API Resources are version-namespaced (`App\Http\Resources\V1`).

## Documentation
OpenAPI 3 generated via `l5-swagger` from controller annotations. Served at `/api/documentation`.

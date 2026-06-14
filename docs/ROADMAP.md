# Delivery Roadmap

The project is built in 7 incremental, production-ready phases. Each phase leaves the
codebase in a runnable, tested state.

## Phase 1 — Foundation (DELIVERED)
- Complete MySQL schema: 20 migrations with foreign keys, indexes, constraints, soft deletes.
- ER diagram (`docs/ER-DIAGRAM.md`).
- Database design reference (`docs/DATABASE-DESIGN.md`).
- API architecture & conventions (`docs/API-ARCHITECTURE.md`).
- Eloquent models with full relationships.
- Backend folder structure following Clean Architecture (Controllers → Services → Repositories).
- Versioned API route skeleton (`routes/api.php`).
- `composer.json`, `.env.example`.

> **Status:** Phases 1–7 delivered. See each section below; per-phase details live in
> the codebase and the other docs (`API-ARCHITECTURE`, `ADMIN-PANEL`, `DEPLOYMENT`,
> `MOBILE-BUILD`, `MOBILE-STRUCTURE`).

## Phase 2 — Authentication & User Management
- JWT auth: register, login, logout, refresh, forgot/reset password, change password.
- Profile update, delete account (soft delete + data purge job).
- Email verification + welcome email (queued).
- RBAC seeding (roles & permissions).
- Rate limiting, request validation, API resources.

## Phase 3 — Digital Card System
- CRUD cards, duplicate, preview, public card endpoint.
- SEO-friendly slug generation (unique, collision-safe).
- Social links CRUD.
- QR code generation/download/share.
- Plan-based card limits (Free = 1 card).

## Phase 4 — Portfolio, Leads & Analytics
- Portfolio item uploads (image/video/pdf/brochure/catalog) with secure validation.
- Services CRUD.
- Lead capture (public), list/search/export CSV.
- Analytics event ingestion + daily aggregation job.
- Daily/weekly/monthly reports + chart endpoints.
- In-app notifications + queued email on new lead & milestones.

## Phase 5 — Subscriptions & Razorpay
- Subscription plans, purchase, renew, expiry reminders (scheduler).
- Razorpay order creation + webhook verification.
- Payment history, invoice generation (PDF).
- Notifications: activated, expiring, payment success/failure.

## Phase 6 — Admin Panel (Filament)
- Dashboard widgets (users, revenue, subscriptions, cards, leads).
- User / subscription / payment / content management.
- Reporting (CSV/Excel export).
- Role-based access control.

## Phase 7 — Testing, Optimization, Deployment (DELIVERED)
- Pest feature/service tests across auth, cards, leads, analytics, notifications,
  portfolio, subscriptions, team, content, slugs.
- Caching on hot public endpoints (plans, FAQs), eager loading + `withCount` throughout,
  pre-aggregated analytics for charts.
- Swagger/OpenAPI (`l5-swagger`) — root spec + representative annotated endpoints at
  `/api/documentation`.
- Docker (`Dockerfile`, `docker-compose.yml`: nginx + php-fpm + mysql + queue + scheduler),
  nginx/php configs, `.dockerignore`.
- GitHub Actions CI (`.github/workflows/ci.yml`), Pint config.
- Guides: `DEPLOYMENT.md`, `MOBILE-BUILD.md`.

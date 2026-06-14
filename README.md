# DCard — Digital Visiting Card SaaS

A production-ready Digital Visiting Card platform built with **React Native**, **Laravel 12**, and **MySQL**.

> No Firebase. No OneSignal. No paid notification services.
> Notifications are delivered via a custom **in-app notification system** + **queued email notifications**.

---

## Repository Layout

```
dcard/
├── README.md
├── docs/                      # Architecture & design documentation
│   ├── DATABASE-DESIGN.md     # Tables, columns, indexes, constraints
│   ├── ER-DIAGRAM.md          # Mermaid entity-relationship diagram
│   ├── API-ARCHITECTURE.md    # REST API design, versioning, conventions
│   └── ROADMAP.md             # Phased delivery plan (7 phases)
│
├── backend/                   # Laravel 12 REST API + Filament admin
│   ├── app/
│   │   ├── Models/            # Eloquent models (relationships)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Requests/      # Form Request validation
│   │   │   ├── Resources/     # API Resources (JSON transformers)
│   │   │   └── Middleware/
│   │   ├── Services/          # Business logic (Clean Architecture)
│   │   ├── Repositories/      # Data access layer
│   │   ├── Policies/          # Authorization
│   │   ├── Notifications/     # In-app + mail notifications
│   │   ├── Jobs/              # Queued jobs
│   │   ├── Mail/              # Mailables
│   │   ├── Enums/             # Typed enums
│   │   └── Filament/          # Admin panel resources
│   ├── database/migrations/   # All schema migrations
│   ├── routes/api.php         # Versioned API routes
│   ├── composer.json
│   └── .env.example
│
└── mobile/                    # React Native app
    └── (see docs/ for structure — generated in Phase 2+)
```

## Tech Stack

| Layer            | Technology                                                        |
|------------------|-------------------------------------------------------------------|
| Mobile           | React Native, React Navigation, Zustand, Axios, React Native Paper |
| Backend          | Laravel 12, PHP 8.2+, JWT, Queues, Scheduler, REST                |
| Database         | MySQL 8                                                            |
| Admin            | Laravel Filament 3 (RBAC)                                          |
| Payments         | Razorpay                                                           |
| Storage          | Local (dev) → Cloudflare R2-ready (prod)                           |
| Docs             | Swagger / OpenAPI (l5-swagger)                                     |

## Run it end-to-end

See [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — stand up the backend API, Filament admin,
mobile app, and web app together, with a full click-through verification checklist.

## Phased Delivery

This project is delivered in 7 phases. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

- **Phase 1 (current):** Database architecture, ER diagram, migrations, folder structure, API architecture.
- Phase 2: Authentication & user management.
- Phase 3: Digital card system.
- Phase 4: Portfolio, leads & analytics.
- Phase 5: Subscriptions & Razorpay.
- Phase 6: Filament admin panel.
- Phase 7: Testing, optimization, deployment, documentation.

## Getting Started (Backend)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
# configure DB credentials in .env
php artisan migrate
php artisan db:seed
php artisan serve
```

Queue worker & scheduler (required for notifications/emails):

```bash
php artisan queue:work
php artisan schedule:work
```

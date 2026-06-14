# Deployment Guide

Covers backend (Laravel API + Filament admin) deployment via Docker or a traditional
LEMP stack, plus the queue worker, scheduler, and Cloudflare R2 storage.

## 1. Environment variables

Copy `.env.example` → `.env` and set, at minimum:

| Key | Notes |
|-----|-------|
| `APP_KEY` | `php artisan key:generate` |
| `APP_ENV` / `APP_DEBUG` | `production` / `false` |
| `APP_URL` / `CARD_PUBLIC_BASE_URL` / `APP_FRONTEND_URL` | public URLs |
| `DB_*` | MySQL credentials |
| `JWT_SECRET` | `php artisan jwt:secret` |
| `QUEUE_CONNECTION` | `database` (or `redis`) |
| `MAIL_*` | any SMTP provider (no paid push services) |
| `RAZORPAY_KEY/SECRET/WEBHOOK_SECRET` | payment gateway |
| `FILESYSTEM_DISK` | `local` (dev) → `r2` (prod) |
| `R2_*` | Cloudflare R2 (S3-compatible) credentials |

## 2. Docker (recommended)

```bash
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan jwt:secret --force
docker compose exec app php artisan migrate --seed --force
docker compose exec app php artisan storage:link
docker compose exec app php artisan filament:assets
```

Services started: `nginx` (:8000), `app` (php-fpm), `mysql`, `queue` (worker),
`scheduler` (Laravel scheduler loop). API at `http://localhost:8000/api/v1`,
admin at `/admin`, Swagger UI at `/api/documentation`.

## 3. Traditional LEMP

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan jwt:secret --force
php artisan migrate --seed --force
php artisan storage:link
php artisan filament:assets

# Production caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan l5-swagger:generate
```

Point your web server's document root at `backend/public`.

### Queue worker (systemd)

```ini
# /etc/systemd/system/dcard-queue.service
[Unit]
Description=DCard queue worker
After=network.target mysql.service

[Service]
User=www-data
Restart=always
WorkingDirectory=/var/www/dcard/backend
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now dcard-queue
```

### Scheduler (cron)

```cron
* * * * * cd /var/www/dcard/backend && php artisan schedule:run >> /dev/null 2>&1
```

This drives `analytics:aggregate` (00:15) and `subscriptions:check` (06:00).

## 4. Razorpay webhook

In the Razorpay dashboard, add a webhook → `https://api.dcard.app/api/v1/payments/webhook`,
events `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET`.

## 5. Cloudflare R2 (production media)

Set `FILESYSTEM_DISK=r2` and the `R2_*` keys. Application code uses the default disk
throughout (avatars, portfolio, banners), so no code changes are needed to switch from
local to R2.

## 6. Production checklist

- [ ] `APP_DEBUG=false`, strong `APP_KEY`/`JWT_SECRET`
- [ ] HTTPS termination + HSTS at the proxy
- [ ] `CORS_ALLOWED_ORIGINS` restricted to your app/web origins
- [ ] DB backups + migrations run with `--force`
- [ ] Queue worker + scheduler running and monitored
- [ ] Rate limits reviewed (`API_RATE_LIMIT`, `AUTH_RATE_LIMIT`, `PUBLIC_RATE_LIMIT`)
- [ ] Config/route/view caches warmed
- [ ] Swagger regenerated (`l5-swagger:generate`)

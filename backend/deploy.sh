#!/usr/bin/env bash
#
# DCard backend — one-shot deploy/update script for Hostinger cPanel (shared hosting).
#
# WHAT THIS DOES (the automatable parts of docs/DEPLOYMENT.md):
#   - installs PHP dependencies (composer, prod mode)
#   - creates/updates .env with your production values (prompts for secrets)
#   - generates APP_KEY + JWT_SECRET (only if missing — safe to re-run)
#   - runs migrations (+ optional seeding on first deploy)
#   - links storage, builds Filament assets, generates Swagger
#   - warms config/route/view/event caches
#   - fixes storage/ + bootstrap/cache permissions
#
# WHAT YOU STILL DO IN THE cPANEL UI (cannot be scripted):
#   1. Select PHP 8.3 (or 8.2) for apidcard.copg.in  (+ ensure gd, zip, intl on)
#   2. Create the MySQL database + user (ALL PRIVILEGES) — have the creds ready
#   3. Set the apidcard.copg.in document root -> .../dcard-backend/public
#   4. Run AutoSSL/Let's Encrypt for apidcard.copg.in
#   5. Add the 2 cron jobs printed at the end of this script
#
# USAGE (from inside the backend folder, e.g. ~/dcard-backend):
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Re-running is safe: it won't regenerate existing keys and won't re-seed unless asked.

set -euo pipefail

# --- locate php -------------------------------------------------------------
# Override if your host needs a specific binary, e.g.:
#   PHP_BIN=/opt/alt/php83/usr/bin/php ./deploy.sh
PHP_BIN="${PHP_BIN:-$(command -v php8.3 || command -v php8.2 || command -v php || true)}"
if [ -z "$PHP_BIN" ]; then
  echo "ERROR: no php binary found. Set PHP_BIN=/path/to/php and re-run." >&2
  exit 1
fi
echo "==> Using PHP: $PHP_BIN ($("$PHP_BIN" -r 'echo PHP_VERSION;'))"

# must be run from the Laravel root
if [ ! -f artisan ]; then
  echo "ERROR: run this from the backend folder (no ./artisan found here)." >&2
  exit 1
fi

# --- locate composer (download if absent) -----------------------------------
export COMPOSER_MEMORY_LIMIT=-1
if command -v composer >/dev/null 2>&1; then
  COMPOSER="composer"
else
  if [ ! -f composer.phar ]; then
    echo "==> composer not found; downloading composer.phar ..."
    "$PHP_BIN" -r "copy('https://getcomposer.org/installer','composer-setup.php');"
    "$PHP_BIN" composer-setup.php --quiet
    rm -f composer-setup.php
  fi
  COMPOSER="$PHP_BIN composer.phar"
fi

# --- helper: set or replace a key in .env -----------------------------------
set_env() {
  local key="$1"; shift
  local val="$*"
  # escape backslash, ampersand and the pipe delimiter for sed
  local esc
  esc=$(printf '%s' "$val" | sed -e 's/[\\&|]/\\&/g')
  if grep -qE "^[#[:space:]]*${key}=" .env; then
    sed -i -E "s|^[#[:space:]]*${key}=.*|${key}=${esc}|" .env
  else
    printf '%s=%s\n' "$key" "$val" >> .env
  fi
}

# helper: prompt with a default (default shown in brackets; enter keeps it)
ask() {
  local prompt="$1" default="${2:-}" reply
  if [ -n "$default" ]; then
    read -r -p "$prompt [$default]: " reply
    echo "${reply:-$default}"
  else
    read -r -p "$prompt: " reply
    echo "$reply"
  fi
}

# helper: prompt for a secret (no echo), required
ask_secret() {
  local prompt="$1" reply
  read -r -s -p "$prompt: " reply; echo "" >&2
  echo "$reply"
}

# --- 1. dependencies --------------------------------------------------------
echo "==> Installing PHP dependencies (this can take a minute)..."
$COMPOSER install --no-dev --optimize-autoloader --no-interaction

# --- 2. .env ----------------------------------------------------------------
if [ ! -f .env ]; then
  echo "==> Creating .env from .env.example"
  cp .env.example .env
fi

echo ""
echo "==> Database connection (from cPanel > MySQL Databases)"
DB_DATABASE_VAL="$(ask 'DB name'     "$(grep -E '^DB_DATABASE=' .env | cut -d= -f2-)")"
DB_USERNAME_VAL="$(ask 'DB user'     "$(grep -E '^DB_USERNAME=' .env | cut -d= -f2-)")"
DB_PASSWORD_VAL="$(ask_secret 'DB password')"

echo ""
echo "==> Admin accounts to seed (use STRONG passwords — these are real logins)"
ADMIN_EMAIL_VAL="$(ask 'Admin email' "$(grep -E '^ADMIN_EMAIL=' .env | cut -d= -f2-)")"
ADMIN_PASSWORD_VAL="$(ask_secret 'Admin password')"
SUPERADMIN_EMAIL_VAL="$(ask 'Super-admin email' "$(grep -E '^SUPERADMIN_EMAIL=' .env | cut -d= -f2-)")"
SUPERADMIN_PASSWORD_VAL="$(ask_secret 'Super-admin password')"

echo ""
echo "==> Writing production values to .env"
set_env APP_NAME            DCard
set_env APP_ENV             production
set_env APP_DEBUG           false
set_env APP_TIMEZONE        Asia/Kolkata
set_env APP_URL             https://apidcard.copg.in
set_env APP_FRONTEND_URL    https://dcard.copg.in
set_env CARD_PUBLIC_BASE_URL https://dcard.copg.in
set_env CORS_ALLOWED_ORIGINS https://dcard.copg.in
set_env LOG_LEVEL           error

set_env DB_CONNECTION       mysql
set_env DB_HOST             localhost
set_env DB_PORT             3306
set_env DB_DATABASE         "$DB_DATABASE_VAL"
set_env DB_USERNAME         "$DB_USERNAME_VAL"
set_env DB_PASSWORD         "$DB_PASSWORD_VAL"

set_env CACHE_STORE         database
set_env QUEUE_CONNECTION    database
set_env SESSION_DRIVER      database
set_env SESSION_SECURE_COOKIE true

set_env ADMIN_EMAIL         "$ADMIN_EMAIL_VAL"
set_env ADMIN_PASSWORD      "$ADMIN_PASSWORD_VAL"
set_env SUPERADMIN_EMAIL    "$SUPERADMIN_EMAIL_VAL"
set_env SUPERADMIN_PASSWORD "$SUPERADMIN_PASSWORD_VAL"

# --- 3. app key + jwt secret (only if missing) ------------------------------
if [ -z "$(grep -E '^APP_KEY=' .env | cut -d= -f2-)" ]; then
  echo "==> Generating APP_KEY"
  "$PHP_BIN" artisan key:generate --force
else
  echo "==> APP_KEY already set (keeping it)"
fi

if [ -z "$(grep -E '^JWT_SECRET=' .env | cut -d= -f2-)" ]; then
  echo "==> Generating JWT_SECRET"
  "$PHP_BIN" artisan jwt:secret --force
else
  echo "==> JWT_SECRET already set (keeping it)"
fi

# --- 4. migrate (+ optional seed) -------------------------------------------
SEED="$(ask 'Run database seeders? Choose y ONLY on the first deploy (y/N)' 'N')"
echo "==> Running migrations"
if [[ "$SEED" =~ ^[Yy]$ ]]; then
  "$PHP_BIN" artisan migrate --seed --force
else
  "$PHP_BIN" artisan migrate --force
fi

# --- 5. storage link + assets + swagger -------------------------------------
echo "==> Linking storage"
rm -f public/storage           # drop any dangling/Docker symlink
"$PHP_BIN" artisan storage:link

echo "==> Publishing Filament assets + Swagger docs"
"$PHP_BIN" artisan filament:assets
"$PHP_BIN" artisan l5-swagger:generate || echo "   (swagger generate skipped/failed — non-fatal)"

# --- 6. caches --------------------------------------------------------------
echo "==> Warming caches"
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache
"$PHP_BIN" artisan event:cache

# --- 7. permissions ---------------------------------------------------------
echo "==> Fixing permissions on storage/ and bootstrap/cache"
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# --- done -------------------------------------------------------------------
APP_DIR="$(pwd)"
cat <<EOF

============================================================
 ✅ DCard backend deploy finished.

 Test now:
   https://apidcard.copg.in/api/documentation   (Swagger)
   https://apidcard.copg.in/admin               (Filament admin login)

 STILL TO DO in cPanel UI:
  - Run AutoSSL for apidcard.copg.in (if not already green)
  - Add these two CRON JOBS (cPanel > Cron Jobs).
    Find your cron php path first: 'which php' = $PHP_BIN

    # Scheduler (analytics aggregation + subscription checks)
    * * * * * $PHP_BIN $APP_DIR/artisan schedule:run >> /dev/null 2>&1

    # Queue worker (sends welcome/lead/payment emails)
    * * * * * $PHP_BIN $APP_DIR/artisan queue:work --stop-when-empty --max-time=55 >> /dev/null 2>&1

 LATER (separate steps): fill RAZORPAY_*, R2_*, MAIL_*, and
 GOOGLE_PLAY_* in .env, then re-run:  ./deploy.sh
============================================================
EOF

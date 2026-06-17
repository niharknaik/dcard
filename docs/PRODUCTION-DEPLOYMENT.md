# DCard — Production Deployment Reference (A→Z)

> The single source of truth for how DCard is deployed in production. If you're
> coming back to this after a break, read this top-to-bottom and you'll know
> exactly how everything is wired and how to operate it.
>
> **Secrets policy:** raw passwords / API secrets are **NOT** stored in this file
> (it's in git). They live only in the server `backend/.env`. This doc tells you
> *what* each secret is, *where* it lives, and *how to view or reset* it.
>
> Product: **DCard** — digital visiting-card platform, a product of **COPG Global**, market **India**.
> Last verified: **2026-06-17**.

---

## 1. Architecture at a glance

| Part | Tech | Hosted on | Public URL |
|---|---|---|---|
| **Web app** (landing, login, dashboard, public cards, legal pages) | Next.js 14 | **Vercel** | `https://dcard.copg.in` |
| **Backend API + Admin** (Laravel 12 API, Filament admin, Swagger) | Laravel 12 / PHP 8.3 | **Hostinger** (LiteSpeed shared, cPanel/hPanel) | `https://apidcard.copg.in` |
| **Mobile app** | React Native 0.76 (Android) | Google Play (package `in.copg.dcard`) | — |

- Mobile app **and** the Vercel web app both call the **Hostinger API** over HTTPS.
- Public cards are served by the **web app**: `https://dcard.copg.in/c/<slug>`.
- Admin panel (Filament): `https://apidcard.copg.in/admin`.
- API docs (Swagger): `https://apidcard.copg.in/api/documentation`.

---

## 2. Domains & DNS (registrar: Hostinger, zone for `copg.in`)

| Subdomain | Points to | How |
|---|---|---|
| `dcard.copg.in` | **Vercel** | DNS record (CNAME → `cname.vercel-dns.com` or A → `76.76.21.21`) added in Hostinger DNS Zone. Domain added in the Vercel project. **NOT** a cPanel subdomain. |
| `apidcard.copg.in` | **Hostinger** | Created as a cPanel/hPanel subdomain on the hosting account; its docroot is `public_html` (see §4). SSL via AutoSSL/Let's Encrypt. |

> ⚠️ `in` package-name note (mobile): the Android package is `in.copg.dcard`. `in`
> is a reserved word in Kotlin, so source files use a backtick-escaped package:
> `` package `in`.copg.dcard ``. The Gradle `namespace`/`applicationId` strings are plain `in.copg.dcard`.

---

## 3. Hostinger account & SSH access

| Item | Value |
|---|---|
| cPanel username | `u120366511` |
| SSH host / IP | `145.79.211.247` (server hostname `in-mum-web2124`, Mumbai) |
| SSH port | `65002` |
| Connect | `ssh -p 65002 u120366511@145.79.211.247` |
| Panel | hPanel: https://hpanel.hostinger.com |

PHP:
- Default CLI `/usr/bin/php` is **8.2** — **too old** (app requires PHP 8.3).
- Use **8.3** at `/opt/alt/php83/usr/bin/php`.
- **Always run this first in any SSH session** before composer/artisan:
  ```bash
  export PATH=/opt/alt/php83/usr/bin:$PATH
  hash -r
  ```
- Required PHP extensions (enabled in hPanel → PHP Configuration): `bcmath, curl, gd, intl, mbstring, pdo_mysql, zip, sodium, openssl, tokenizer, fileinfo`.
  - `sodium` was OFF by default and had to be enabled (needed by `lcobucci/jwt`).

---

## 4. Server directory layout & document root

The whole Laravel app lives **inside the subdomain folder**, and the fixed docroot
`public_html` is a **symlink to Laravel's `public/`** (Hostinger doesn't let you change
the docroot, so we symlink instead).

```
/home/u120366511/domains/apidcard.copg.in/      <-- Laravel root (base_path)
├── app/  bootstrap/  config/  database/  routes/  vendor/  storage/
├── .env                                          <-- ALL secrets live here (chmod 600 ideally)
├── deploy.sh                                     <-- one-shot deploy/update script
├── artisan
├── public/                                       <-- real Laravel public dir
│   ├── index.php
│   ├── .htaccess                                 <-- clean Laravel rewrite rules (+ Authorization header pass)
│   └── storage  ->  ../storage/app/public        <-- created by `php artisan storage:link`
└── public_html  ->  public                       <-- the web docroot LiteSpeed serves (symlink)
```

If `public_html` ever stops pointing at `public` (e.g. Hostinger recreates it):
```bash
cd /home/u120366511/domains/apidcard.copg.in
rm -rf public_html && ln -s public public_html
```

> The app source, `.env`, and `vendor/` are NOT under `public_html`, so they are not web-accessible. Only `public/` (via the symlink) is served.

---

## 5. Database (MySQL / MariaDB)

| Item | Value |
|---|---|
| Engine | MariaDB (Hostinger) |
| Host | `localhost`, port `3306` |
| Database | `u120366511_dcard` |
| User | `u120366511_dcard_user` |
| Password | **in server `.env`** (reset via hPanel → Databases → MySQL if lost) |

Notes / gotchas:
- Hostinger **prefixes** DB names and users with the account id (`u120366511_`). Use the exact full names shown in hPanel → Databases.
- Use **alphanumeric** DB passwords (symbols like `@ # /` break both MySQL login and `.env` parsing).
- Cache/queue/session all use the **database** driver (no Redis): `CACHE_STORE=database`, `QUEUE_CONNECTION=database`, `SESSION_DRIVER=database`.

---

## 6. Environment variables (`backend/.env`)

`.env` is git-ignored and lives only on the server. View current values:
```bash
grep -E '^(APP_|DB_|MAIL_|RAZORPAY_|GOOGLE_PLAY_|FILESYSTEM|CORS_|SESSION_)' /home/u120366511/domains/apidcard.copg.in/.env
```

Key settings (non-secret values shown; secrets marked *(in .env)*):

```
APP_NAME=DCard
APP_ENV=production
APP_DEBUG=false
APP_TIMEZONE=Asia/Kolkata
APP_URL=https://apidcard.copg.in
APP_FRONTEND_URL=https://dcard.copg.in
CARD_PUBLIC_BASE_URL=https://dcard.copg.in
CORS_ALLOWED_ORIGINS=https://dcard.copg.in
LOG_LEVEL=error
APP_KEY=                      # generated on server (php artisan key:generate)  *(in .env)*
JWT_SECRET=                   # generated on server (php artisan jwt:secret)     *(in .env)*

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u120366511_dcard
DB_USERNAME=u120366511_dcard_user
DB_PASSWORD=                  # *(in .env)*

CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true

# Mail — own domain mailbox (see §9)
MAIL_MAILER=smtp
MAIL_HOST=smtp.copg.in
MAIL_PORT=465
MAIL_ENCRYPTION=ssl
MAIL_USERNAME=dcard@copg.in
MAIL_PASSWORD=                # *(in .env)*
MAIL_FROM_ADDRESS=dcard@copg.in

# Razorpay — LIVE (see §10)
RAZORPAY_KEY=rzp_live_T2guh2kkJvaEUE     # key id (semi-public; appears in checkout)
RAZORPAY_SECRET=             # *(in .env)*
RAZORPAY_WEBHOOK_SECRET=     # *(in .env)*

# Storage — local on the Hostinger disk (see §11). No R2 needed.
FILESYSTEM_DISK=local        # media uses Storage::disk('public') explicitly regardless

# Google Play Billing — server-side purchase verification (TODO, see §13)
GOOGLE_PLAY_PACKAGE_NAME=in.copg.dcard
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=        # TODO: paste service-account JSON, or use _PATH
```

After editing `.env`: run `php artisan config:clear` (during setup) or `php artisan config:cache` (for production performance — do this once everything is final).

---

## 7. Deploy / update process

The committed **`backend/deploy.sh`** automates composer install, key/secret
generation (only if missing), migrations, storage link, asset build, cache warming,
and permissions. It is **idempotent** and safe to re-run.

### First-time deploy (already done — for reference)
```bash
# in cPanel/hPanel UI first: set PHP 8.3, create MySQL DB+user, enable AutoSSL
cd ~
git clone https://github.com/niharknaik/dcard.git dcard-src
SUB=/home/u120366511/domains/apidcard.copg.in
shopt -s dotglob; mv dcard-src/backend/* "$SUB"/; shopt -u dotglob
rm -rf dcard-src
cd "$SUB"
rm -rf public_html && ln -s public public_html
export PATH=/opt/alt/php83/usr/bin:$PATH; hash -r
./deploy.sh        # prompts for DB creds + admin emails/passwords; answer 'y' to seed ONCE
```

### Updating code later (pull latest from GitHub)
The server has no `.git` (we moved `backend/*` out of the clone). To update:
```bash
cd ~
git clone https://github.com/niharknaik/dcard.git dcard-src
SUB=/home/u120366511/domains/apidcard.copg.in
# copy updated files over (keeps your .env, storage/, vendor/ if you prefer):
cp -r dcard-src/backend/app dcard-src/backend/routes dcard-src/backend/config \
      dcard-src/backend/resources dcard-src/backend/database "$SUB"/
rm -rf dcard-src
cd "$SUB"
export PATH=/opt/alt/php83/usr/bin:$PATH; hash -r
./deploy.sh        # answer 'N' to seeders (NEVER re-seed prod — it wipes data)
```
> Tip: a cleaner long-term option is to `git clone` into `~/dcard-src` and rsync,
> or keep a real git checkout. For now the copy-over works.

### Re-running deploy.sh — IMPORTANT
- It keeps existing `APP_KEY` / `JWT_SECRET` (won't regenerate).
- **Always answer `N` to the "Run seeders?" prompt** on an existing prod DB. `y` runs `migrate --seed` which is fine, but seeding twice can duplicate/append data; only seed on the very first deploy.

---

## 8. Cron jobs (no systemd on shared hosting)

Set in hPanel → Advanced → **Cron Jobs**, both **every minute** (`* * * * *`):

```
* * * * * /opt/alt/php83/usr/bin/php /home/u120366511/domains/apidcard.copg.in/artisan schedule:run >> /dev/null 2>&1
* * * * * /opt/alt/php83/usr/bin/php /home/u120366511/domains/apidcard.copg.in/artisan queue:work --stop-when-empty --max-time=55 >> /dev/null 2>&1
```
- **Scheduler** drives `analytics:aggregate` (00:15) and `subscriptions:check` (06:00).
- **Queue worker** sends welcome / lead / payment / announcement emails (`--stop-when-empty` exits when idle so crons don't overlap).

---

## 9. Mail / SMTP

- Uses the **own-domain mailbox** `dcard@copg.in` on `smtp.copg.in:465` (SSL).
- Config in `.env` (§6). Laravel reads `MAIL_ENCRYPTION` (confirmed in `config/mail.php`).
- If sending fails, try port `587` + `MAIL_ENCRYPTION=tls`.
- Test sending:
  ```bash
  php artisan tinker --execute='Mail::raw("test", function ($m) { $m->to("dcard@copg.in")->subject("test"); }); echo "sent\n";'
  ```

---

## 10. Razorpay (LIVE)

- Account is **live-activated**. Dashboard: https://dashboard.razorpay.com
- `.env`: `RAZORPAY_KEY` (live key id), `RAZORPAY_SECRET` *(in .env)*, `RAZORPAY_WEBHOOK_SECRET` *(in .env)*.
- **Webhook**: `https://apidcard.copg.in/api/v1/payments/webhook`, events **`payment.captured`** + **`payment.failed`**. Route is signature-verified (not JWT). A `POST` with no signature returns **400** (expected).
- Validate keys (creates a harmless unused order):
  ```bash
  php artisan tinker --execute='$a=new \Razorpay\Api\Api(env("RAZORPAY_KEY"),env("RAZORPAY_SECRET")); echo $a->order->create(["amount"=>100,"currency"=>"INR"])["id"]."\n";'
  ```

---

## 11. File storage (local, on the Hostinger disk — no third party)

- The app stores **all media** via `Storage::disk('public')` **explicitly** (avatars, card photos, portfolio, templates, ads). `FILESYSTEM_DISK` is irrelevant for media because the disk is hardcoded.
- `public` disk → `storage/app/public`, served at `APP_URL/storage/...` via the `public/storage` symlink.
- Cloudflare R2 is **not used** (the deployment-guide mention of R2 was aspirational; code never wired it for these resources).
- If uploads 404, recreate the link: `php artisan storage:link`.

---

## 12. Admin panel (Filament)

- URL: `https://apidcard.copg.in/admin`
- Super-admin: **`nihar@copg.in`** (password *in .env* `SUPERADMIN_PASSWORD` / reset via tinker — see §15).
- Default seeded admins (if env() was unavailable during seeding): `admin@dcard.app` / `superadmin@dcard.app` with `Admin@12345` / `Super@12345` — **change these**.
- 🐞 **Critical fix applied:** `app/Models/User.php` must `implement Filament\Models\Contracts\FilamentUser`. Without it, Filament `abort(403)`s the dashboard in `APP_ENV=production` (works in `local`). Fixed in commit `8d648cb`:
  ```php
  class User extends Authenticatable implements JWTSubject, FilamentUser
  ```

---

## 13. Google Play Billing (TODO — do during Play Console setup)

- Backend supports server-side verification of Play purchases via `GOOGLE_PLAY_*`.
- `GOOGLE_PLAY_PACKAGE_NAME=in.copg.dcard` (set).
- Still needed: a **Google Cloud service-account JSON** with Play Developer API access, linked to the Play Console, pasted into `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (or path in `GOOGLE_PLAY_SERVICE_ACCOUNT_PATH`).

---

## 14. Mobile app (Android)

- Package / applicationId: **`in.copg.dcard`**.
- AdMob **App ID** (in `mobile/app.json`): `ca-app-pub-9781294008914170~7699469148`.
- AdMob **banner unit ID** (set in Admin → Settings → Ads → `admob_android_banner_id`): `ca-app-pub-9781294008914170/9332451724`; toggle `admob_enabled` on.
- API base URL must point to `https://apidcard.copg.in` (rebuild required when changed).
- **TODO for store:** create a release **keystore**, build a signed **`.aab`** (target SDK 35), upload to Play Console, set up testing tracks, complete Data Safety / content rating / privacy policy.

---

## 15. Runbook — common operations

```bash
# --- always start an SSH session with this ---
cd /home/u120366511/domains/apidcard.copg.in
export PATH=/opt/alt/php83/usr/bin:$PATH; hash -r

# clear caches (after editing .env or code)
php artisan optimize:clear

# cache for performance (do once when config is final)
php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache

# reset the super-admin password (model auto-hashes via 'hashed' cast — pass PLAIN text)
php artisan tinker --execute='$u=App\Models\User::where("email","nihar@copg.in")->first(); $u->password="NewStrongPass123"; $u->save(); echo "done\n";'

# view recent app errors
tail -n 40 storage/logs/laravel.log
grep -aE "^\[20" storage/logs/laravel.log | tail -10     # just the error message lines

# check key endpoints
for u in /admin /admin/login /api/documentation /up; do echo -n "$u -> "; curl -sS -o /dev/null -w "%{http_code}\n" https://apidcard.copg.in$u; done
```

---

## 16. Gotchas we hit (so you don't again)

1. **403 on `/admin` in production** — `User` model didn't `implement FilamentUser`. NOT a firewall issue. Fix in §12. *Lesson: pull the 403 response body first — a Laravel "403 Forbidden" page rules out the host WAF immediately.*
2. **PHP version** — CLI default is 8.2; app needs 8.3. Always `export PATH=/opt/alt/php83/usr/bin:$PATH`.
3. **`sodium` extension** off by default — enable in hPanel PHP Configuration (jwt needs it to install).
4. **`env()` returns null after `config:cache`** — re-seeding manually after a cached deploy seeded *default* admin creds instead of your `.env` ones. deploy.sh seeds *before* caching, so it's fine there; just don't run `migrate --seed` manually when config is cached.
5. **Special chars in passwords/secrets** — keep them alphanumeric; `@ # / |` break MySQL login, `.env` parsing, and sed commands.
6. **Document root is fixed** to `public_html` — we symlink `public_html → public` (§4).
7. **Hostinger WAF (ModSecurity)** can be disabled per-rule via `.htaccess` `SecRuleRemoveById <id>` (full `SecRuleEngine Off` is ignored) — but in our case the WAF was a red herring; the 403 was the app.
8. **Heredocs/line-endings** — paste multi-line carefully (indented closing `EOF` breaks heredocs); shell scripts must be LF, not CRLF (`sed -i 's/\r$//' file` if you see `^M`).

---

## 17. Remaining launch checklist (backend done ✅)

✅ Deployed · admin working · mail · Razorpay live · storage · AdMob app id · honest landing · package id `in.copg.dcard`

⬜ Google Play Billing service-account JSON (§13)
⬜ AdMob banner id entered in Admin → Settings → Ads (§14)
⬜ `php artisan config:cache` once everything is final (§15)
⬜ Mobile: release keystore + signed `.aab` (target SDK 35) (§14)
⬜ Play Console: listing assets, Data Safety, content rating, privacy/terms/data-deletion URLs (already live at `dcard.copg.in/privacy|terms|data-deletion`), testing track, review
⬜ Switch GitHub repo back to **private** (it was made public for the deploy clone)

See also `docs/LAUNCH-CHECKLIST.md` and `docs/COMPLIANCE.md`.
```

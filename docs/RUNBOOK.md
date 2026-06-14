# DCard — Run & Verify Runbook

End-to-end guide to stand up all four surfaces (backend API, Filament admin, mobile app,
web app) and smoke-test them together. Most code in this repo compiles/type-checks and the
mobile + web logic is unit-tested, but the **backend and the live web↔API integration have
not been executed in this environment** (no PHP runtime). This runbook is how you confirm it.

---

## 0. Prerequisites

| Tool | Version | For |
|------|---------|-----|
| PHP | 8.2+ (with `pdo_mysql`, `gd`, `mbstring`, `openssl`, `fileinfo`) | backend |
| Composer | 2.x | backend deps |
| MySQL | 8.x (or MariaDB 10.6+) | database |
| Node.js | 18+ (20/22 fine) | mobile + web |
| Android Studio / Xcode | latest | mobile native build (optional) |

Optional accounts: **Razorpay** (test keys) for checkout, **Google AdMob** for the ad fallback.

---

## 1. Backend API + Admin (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# --- edit .env: DB_*, MAIL_*, RAZORPAY_* (test keys), APP_URL,
#     APP_FRONTEND_URL (http://localhost:3000 — the web app; used in emails) ---

php artisan migrate --seed     # schema + roles/permissions + plans + admins + settings + ads
php artisan storage:link       # serve uploaded images (avatars, card photos, ads, portfolio)
php artisan serve              # http://localhost:8000
```

In a second/third terminal (needed for emails + scheduled jobs):

```bash
php artisan queue:work         # welcome/lead/payment/announcement emails
php artisan schedule:work      # subscription expiry checks, analytics aggregation
```

### Seeded accounts (override in `.env` before seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `ADMIN_EMAIL` (admin@dcard.app) | `ADMIN_PASSWORD` (Admin@12345) |
| Super admin | `SUPERADMIN_EMAIL` (superadmin@dcard.app) | `SUPERADMIN_PASSWORD` (Super@12345) |

> Change these before any non-local deployment.

### CORS (required for the web app)

The web app calls the API from a different origin (`:3000` → `:8000`). Ensure
`backend/config/cors.php` allows it — `allowed_origins` should include
`http://localhost:3000` (or `*` for local dev), with `paths` covering `api/*`.

### Backend tests (optional but recommended)

```bash
php artisan test            # Pest/PHPUnit feature suite under backend/tests
```

---

## 2. Mobile app (React Native)

```bash
cd mobile
npm install --legacy-peer-deps     # RN 0.76 vs navigation/screens peer ranges
cp .env.example .env               # set API_BASE_URL (e.g. http://10.0.2.2:8000/api/v1 on Android emulator)
npm test                           # 139 Jest tests (should be green)
npm run tsc                        # type-check

# run on a device/emulator (needs Android Studio / Xcode):
npm run android      # or: npm run ios
```

- Android emulator reaches host as `10.0.2.2`; iOS simulator uses `localhost`.
- AdMob fallback: only active if `admob_enabled` + unit IDs are set in Admin → App Settings
  AND the `react-native-google-mobile-ads` native setup is done (app ID in `app.json` /
  Info.plist / AndroidManifest). Without it, only house ads show (by design).

---

## 3. Web app (Next.js)

```bash
cd web
npm install
cp .env.example .env.local         # set API_URL + NEXT_PUBLIC_API_URL to http://localhost:8000/api/v1
npm test                           # 15 Jest tests (vcard, api-client, razorpay, card, qr)
npm run build                      # production build (11 routes)
npm run dev                        # http://localhost:3000
```

- `API_URL` (server) powers the SSR public card viewer `/c/[slug]`.
- `NEXT_PUBLIC_API_URL` (browser) powers `/login` + `/dashboard`.

---

## 4. End-to-end smoke test (the click-through)

With backend (`:8000`), web (`:3000`), and queue worker running:

### Public + auth
1. Open `http://localhost:3000` → landing renders (hero, pricing = Free/Premium/Business).
2. Register a user in the **mobile app** (or via API) — confirm the welcome email lands in
   your mail catcher / `queue:work` log.
3. Web `/login` with that user → lands on `/dashboard` (overview stats load).

### Cards
4. `/dashboard/cards` → **New card** → fill name → Create. It appears in the list.
5. **Edit** the card → upload a **card photo** → add a **social link**, a **service**, and a
   **portfolio** item (portfolio needs Premium — expect a 403 on Free; see step 9).
6. Click **View** → the public page `/c/{slug}` renders avatar, actions, sections, and a **QR**.
   - Scan the QR → it opens the same public URL.
   - **Save contact** downloads a `.vcf`; **Copy link** copies the URL.
   - Sharing the link shows a rich preview (Open Graph title/photo).

### Leads
7. On the public page, submit a lead (mobile/public form) → it appears under `/dashboard/leads`
   and as a notification; **Mark read** clears the "New" badge.

### Billing
8. `/dashboard/plans` → **Upgrade to Premium** → Razorpay test checkout → use a
   [test card](https://razorpay.com/docs/payments/payments/test-card-details/) → on success
   the plan flips to **Current**.
9. Re-try the portfolio upload from step 5 → now allowed on Premium.

### Profile
10. `/dashboard/profile` → edit name/phone, upload avatar, change password → re-login works.

### Admin (`http://localhost:8000/admin`)
11. Log in as **admin** → Users, Cards, Leads, Payments, Subscriptions, CMS visible.
12. **Refund** the payment from step 8 (Payments → Refund) → status → refunded, user gets a
    `payment_refunded` notification, entry appears in the **Activity log**.
13. Log in as **super admin** → extra items visible: **Plans**, **Access Control** (Roles,
    Permissions), **App Settings**, **Broadcast Announcement**, **Ads**.
14. **Ads:** create a house ad for `dashboard_top` (audience: free) → as a **free** mobile user
    it shows on the dashboard; as Premium it does not (free-only rule).
15. **Broadcast** an announcement to "All" → free users get the in-app notification (+ email if
    queue worker running).
16. **Settings:** toggle **maintenance mode** → app API returns 503 (login still works); toggle
    **signups** off → registration is rejected. Toggle both back.
17. **Roles/Impersonation:** grant a user super admin (Users → Make super admin), generate an
    **impersonation** token, and confirm both are written to the Activity log.

---

## 5. Test commands (recap)

| Surface | Command | Status here |
|---------|---------|-------------|
| Mobile | `cd mobile && npm test` | ✅ 139 passing |
| Web | `cd web && npm test` | ✅ 15 passing |
| Web build | `cd web && npm run build` | ✅ 11 routes |
| Backend | `cd backend && php artisan test` | ⚠️ not run here (needs PHP) |

---

## 6. Troubleshooting

- **CORS error in browser console** → add the web origin to `backend/config/cors.php`,
  `php artisan config:clear`.
- **401 on dashboard** → token expired/cleared; the client redirects to `/login`. Re-login.
- **Image upload fails / "method not allowed"** → uploads POST with `_method=PUT`; ensure the
  request is multipart (the web client handles this via `apiUpload`).
- **`npm install` peer-dep errors in mobile** → use `--legacy-peer-deps` (RN 0.76 constraint).
- **Razorpay "key not configured"** → set `RAZORPAY_KEY`/`RAZORPAY_SECRET` in backend `.env`.
- **No emails** → run `php artisan queue:work`; check `MAIL_*` (use Mailpit/Mailtrap locally).
- **Maintenance mode stuck on** → Admin → App Settings → turn it off (or set `maintenance_mode`
  row to `0` in the `settings` table and clear cache).

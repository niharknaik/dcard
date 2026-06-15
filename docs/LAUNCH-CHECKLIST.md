# DCard — Pre-Launch Readiness Checklist

Product: **DCard** (digital visiting-card SaaS) — a product of **COPG Global**, targeting **India**.
Surfaces: Laravel 12 API + Filament admin (`backend/`), Next.js web app (`web/`), React Native mobile app (`mobile/`) on the **Google Play Store**. Payments via **Razorpay**.

This is the gate before any production / Play Store release. Treat every unchecked box as a blocker until triaged.
Companion doc: [`COMPLIANCE.md`](./COMPLIANCE.md) (India DPDP Act, RBI/Razorpay, GST, Play policies — including the **Play Billing risk** that must be resolved). See also [`RETENTION-POLICY.md`](./RETENTION-POLICY.md) and [`INCIDENT-RESPONSE.md`](./INCIDENT-RESPONSE.md).

> Legend: 🔴 **Must-have** (blocks launch) · 🟡 **Should-have** (fix soon after) · 🔵 nice-to-have

---

## 1. Security hardening

### 1.1 App configuration (`backend/.env`)
The shipped [`backend/.env.example`](../backend/.env.example) is dev-defaulted. Every item below must change for production.

- [ ] 🔴 `APP_ENV=production` (example ships `local`)
- [ ] 🔴 `APP_DEBUG=false` (example ships `true` — leaks stack traces / config via Laravel's Ignition debug pages)
- [ ] 🔴 Strong, unique `APP_KEY` — `php artisan key:generate` on the production host; never reuse the dev key
- [ ] 🔴 Strong, unique `JWT_SECRET` — `php artisan jwt:secret --force`; rotate if it was ever committed/shared
- [ ] 🔴 `LOG_LEVEL=warning` or `error` in production (example ships `debug`)
- [ ] 🔴 Change all seeded admin creds before seeding prod: `ADMIN_EMAIL/PASSWORD`, `SUPERADMIN_EMAIL/PASSWORD` (defaults are `admin@dcard.app / Admin@12345`, `superadmin@dcard.app / Super@12345`)
- [ ] 🔴 `APP_URL`, `CARD_PUBLIC_BASE_URL`, `APP_FRONTEND_URL`, `APP_REFERRAL_BASE_URL` set to real HTTPS domains
- [ ] 🟡 Confirm Ignition / debug routes are not reachable (`APP_DEBUG=false` disables them) and `/api/documentation` (l5-swagger) is access-controlled or disabled in prod

### 1.2 Transport & headers
- [ ] 🔴 HTTPS everywhere (API, web, admin); HTTP redirects to HTTPS
- [ ] 🔴 **HSTS** at the proxy (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`)
- [ ] 🔴 Security headers on API + admin responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (admin), `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy` (admin/web)
- [ ] 🟡 `Permissions-Policy` to disable unused browser features

### 1.3 CORS — [`backend/config/cors.php`](../backend/config/cors.php)
The config reads `CORS_ALLOWED_ORIGINS` and **defaults to `*`** when unset.

- [ ] 🔴 Set `CORS_ALLOWED_ORIGINS` to the real web origin(s) only (e.g. `https://app.dcard.app`) — never `*` in production
- [ ] 🟡 Note `paths` covers `api/*` and `supports_credentials=false` (token auth via header, not cookies — keep it false)

### 1.4 Auth, sessions & cookies
- [ ] 🔴 Confirm `SESSION_SECURE_COOKIE=true` and `SESSION_SAME_SITE=lax`/`strict` for the **Filament admin** (cookie session). `SESSION_DRIVER=database` is fine
- [ ] 🟡 Review `JWT_TTL` (60 min) / `JWT_REFRESH_TTL` (14 days) for your threat model; ensure refresh-token rotation on `auth/refresh`
- [ ] 🟡 Enforce admin password policy / consider 2FA on the Filament panel for super-admins

### 1.5 Rate limiting
The API defines `throttle:public`, `throttle:auth`, `throttle:api` (see [`backend/routes/api.php`](../backend/routes/api.php)); values come from `API_RATE_LIMIT` (60), `AUTH_RATE_LIMIT` (10), `PUBLIC_RATE_LIMIT`.

- [ ] 🔴 Verify `AUTH_RATE_LIMIT` is tight (login / register / forgot-password / reset-password are all behind `throttle:auth`)
- [ ] 🔴 Verify public lead/event endpoints (`POST public/cards/{slug}/leads`, `.../events`) are rate-limited per IP (anti-spam — see COMPLIANCE §5)
- [ ] 🟡 Set explicit `PUBLIC_RATE_LIMIT` rather than relying on a default

### 1.6 Dependencies & code
- [ ] 🔴 `cd backend && composer audit` — no high/critical advisories
- [ ] 🔴 `cd web && npm audit` and `cd mobile && npm audit` — triage high/critical
- [ ] 🟡 Pin/lock dependency versions; keep the mobile RN 0.76 compatibility pins documented in [`ANDROID-BUILD.md`](./ANDROID-BUILD.md)
- [ ] 🟡 No secrets committed (grep for keys); rotate anything that ever lived in git history

### 1.7 Storage & uploads (Cloudflare R2)
Production media (avatars, card photos, portfolio, ads, template previews) should move off local disk to R2 (`FILESYSTEM_DISK=r2`, `R2_*` keys).

- [ ] 🔴 `FILESYSTEM_DISK=r2` with valid `R2_ACCESS_KEY_ID/SECRET/BUCKET/ENDPOINT/URL`
- [ ] 🔴 R2 bucket is **private**; public assets served via the R2 public URL/CDN, user-private files via **signed URLs** (do not make the whole bucket public)
- [ ] 🔴 Validate upload MIME types & size limits server-side (image-only); strip EXIF/geolocation from uploaded photos
- [ ] 🟡 Correct filesystem permissions on `storage/` and `bootstrap/cache/` (writable by web user, not world-writable); `php artisan storage:link` run

---

## 2. Backend deployment

(See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Docker / LEMP specifics.)

- [ ] 🔴 **Queue worker** running & supervised (systemd / Horizon / `docker compose` `queue` service) — required for welcome/lead/payment/announcement emails. Without it, emails never send
- [ ] 🔴 **Scheduler** running (`* * * * * php artisan schedule:run`) — drives `subscriptions:check` (06:00) and `analytics:aggregate` (00:15). Without it, subscription expiry & analytics break
- [ ] 🔴 Mail provider configured (`MAIL_*`) with a verified sending domain (SPF/DKIM/DMARC) — not Mailpit/localhost
- [ ] 🔴 **Database backups** automated (daily + retention) and a **restore** test performed
- [ ] 🔴 Migrations run with `--force`; production caches warmed (`config:cache`, `route:cache`, `view:cache`, `event:cache`)
- [ ] 🔴 **Razorpay webhook** live: endpoint `https://<api-domain>/api/v1/payments/webhook`, events `payment.captured` + `payment.failed`, and `RAZORPAY_WEBHOOK_SECRET` set & matching dashboard (route is signature-verified, not JWT)
- [ ] 🔴 Live `RAZORPAY_KEY` / `RAZORPAY_SECRET` (not test keys) and the gateway switched to live mode
- [ ] 🟡 **Error monitoring** (Sentry or equivalent) wired into Laravel, web, and mobile for crash/exception capture
- [ ] 🟡 **Log management** / rotation (centralized logs, retention policy); avoid logging PII or payment payloads
- [ ] 🟡 Health-check endpoint + uptime monitoring on API, web, admin
- [ ] 🟡 Maintenance-mode toggle (Admin → App Settings) verified to return 503 on app API while keeping login usable

---

## 3. Google Play Store requirements

### 3.1 App signing & build
- [ ] 🔴 Build a **release** AAB/APK with a **real upload keystore** — the shipped artifact in [`ANDROID-BUILD.md`](./ANDROID-BUILD.md) is **debug-signed** (`DCard.apk`) and cannot go to Play
- [ ] 🔴 Enroll in **Play App Signing** (Google manages the app signing key; you keep the upload key)
- [ ] 🔴 Upload format = **Android App Bundle (.aab)**

### 3.2 Target API level
Current `mobile/android/build.gradle`: `minSdkVersion 24`, `compileSdkVersion 35`, **`targetSdkVersion 34`**.

- [ ] 🔴 Bump **`targetSdkVersion` to 35 (Android 15)** — Google Play requires apps to target API **35** for new apps and updates (effective Aug 31, 2025; the current `34` will be rejected). Test thoroughly after bumping
- [ ] 🟡 Keep `compileSdkVersion 35`; confirm RN 0.76 native libs still build (see the version-pin notes in ANDROID-BUILD.md)

### 3.3 Permissions justification
Declared in [`mobile/android/app/src/main/AndroidManifest.xml`](../mobile/android/app/src/main/AndroidManifest.xml):

| Permission | Declared? | Justification |
|---|---|---|
| `android.permission.INTERNET` | Yes | API calls to the DCard backend (cards, leads, payments, notifications). Required; no justification prompt needed |
| Camera / Photo & media | **Not declared** | If image upload (avatar / card photo / portfolio) uses the system photo picker, no permission is needed. **If** you add an image-picker/camera library, declare it here and justify it in Data Safety + a permissions declaration |
| Location (fore/background) | **None** | DCard uses **no location**. Declare "no location access" in the Data Safety form |
| Ads (AdMob) | implicit | `react-native-google-mobile-ads` adds its own manifest entries; see §3.7 |

- [ ] 🔴 Re-audit the **final** built manifest (merged, post-autolink) for any permission added by AdMob/RN libs and justify each
- [ ] 🔴 Declare **no foreground/background location** in the console

### 3.4 Data Safety form
Map every data type DCard actually collects:

| Data type | Collected | Purpose | Shared | Notes |
|---|---|---|---|---|
| **Name** | Yes | Account, card content | No (rendered on public card) | On public card by user's own choice |
| **Email** | Yes | Account, auth, transactional email | No | |
| **Phone** | Yes | Profile / card contact | No | |
| **Photos** | Yes | Avatar, card photo, portfolio images | No | Stored in R2 |
| **App activity / usage** | Yes | Card views, lead/analytics events | No | First-party analytics (`/cards/{card}/analytics`) |
| **Analytics / diagnostics** | Yes (if Sentry/AdMob) | Crash & performance | Shared w/ Google (AdMob/Sentry) | Declare third-party SDKs |
| **Payment info** | **No card storage** | Subscriptions/templates | Processed by **Razorpay** | We store only invoice/transaction IDs, never card data (PCI handled by Razorpay) |
| **Lead-capture data** (visitor name/email/phone via public form) | Yes | Card owner's leads | No | Visitor-provided; ensure consent text on the form |

- [ ] 🔴 Complete & submit the Data Safety form matching the table above
- [ ] 🔴 Declare all data is **encrypted in transit** (HTTPS) and the **deletion** mechanism (§3.5)
- [ ] 🔴 Disclose third-party SDKs that collect data (AdMob, Sentry/Razorpay) in Data Safety
- [ ] 🟡 Keep the form in sync with the privacy policy (must not contradict)

### 3.5 Account deletion (Play requirement)
DCard already exposes in-app deletion: **`DELETE /api/v1/account`** ([`routes/api.php`](../backend/routes/api.php) → `ProfileController@destroy`).

- [ ] 🔴 Surface an **in-app "Delete account"** action (mobile Profile screen + web `/dashboard/profile`) calling `DELETE /v1/account`
- [ ] 🔴 Provide a **public web deletion URL** (e.g. `https://app.dcard.app/data-deletion`) — **does not exist yet** in `web/app/`; must be created (see §5). Submit this URL in the Play Console Data deletion section
- [ ] 🔴 Page must explain what is deleted vs retained (e.g. invoices retained for tax/GST — see COMPLIANCE §1/§3) and how to request deletion without the app
- [ ] 🟡 Confirm `ProfileController@destroy` cascades/anonymizes related data (cards, leads, portfolio, wallet) per the retention policy

### 3.6 Privacy Policy, content rating, ads
- [ ] 🔴 **Privacy Policy URL** live and reachable (e.g. `/privacy`) — **not present** in `web/app/` yet; create it (§5). Required in Play Console + store listing
- [ ] 🔴 Complete the **IARC content-rating questionnaire** (UGC + ads → expect higher tier; answer truthfully re: user-generated content and ads)
- [ ] 🔴 **Ads declaration**: the app **contains ads** (AdMob + house ads). Mark "Contains ads" in the console
- [ ] 🔴 **AdMob app ID is a Google sample/test ID** in `mobile/app.json` (`ca-app-pub-3940256099942544~...`) — replace with your **real AdMob app ID & unit IDs** before release (shipping test ads = policy violation / no revenue)
- [ ] 🔴 **Prominent disclosure & consent** for any data collected (ads/analytics) before collection; for India/EEA users provide consent (UMP/CMP for AdMob)
- [ ] 🟡 Ad content rating + families policy: ensure ads aren't shown in any child-directed context (DCard is 18+; see COMPLIANCE §5)

### 3.7 Subscriptions / billing — ⚠️ CRITICAL POLICY RISK
- [ ] 🔴 **Resolve the Google Play Billing question** before launch. DCard sells **subscriptions, template unlocks, and reward redemptions** *inside the Android app* via **Razorpay** (`subscriptions/checkout`, `templates/{id}/unlock`, `payments/verify`). Google Play generally **requires Play Billing for in-app digital goods/subscriptions**; using Razorpay for these may violate policy. See **COMPLIANCE §4** for the full analysis and options. **Do not ship the Android app until this is decided.**

### 3.8 Testing tracks & store listing
- [ ] 🔴 Run **closed testing** (Google now requires new personal developer accounts to run closed testing with 12+ testers for 14 days before production) — start this early
- [ ] 🔴 Store listing assets: app icon (512×512), feature graphic (1024×500), ≥2 phone screenshots, short + full description, category, contact email, privacy policy URL
- [ ] 🟡 Internal testing track validated first; staged rollout for production
- [ ] 🟡 Developer account: D-U-N-S / verification, app access instructions (provide a test login: a non-super-admin user) for reviewers

---

## 4. iOS / App Store (if applicable)

DCard's RN app could target iOS, but this repo's release path is **Play Store only** today. If/when iOS ships:

- [ ] App Store Connect record, signing certs & provisioning profiles
- [ ] **App Privacy** "nutrition label" (mirror §3.4) and tracking transparency (ATT) prompt if AdMob tracks
- [ ] **Account deletion** in-app (Apple requires it for accounts) → `DELETE /v1/account`
- [ ] ⚠️ **StoreKit / In-App Purchase**: same digital-goods concern as Play — Apple requires IAP for in-app digital purchases; Razorpay would not be permitted for them (see COMPLIANCE §4)
- [ ] Privacy policy + support URLs, content rating (4+/17+ per UGC), screenshots per device class

---

## 5. Web app (`web/`)

Current routes (from `web/app/`): `/`, `/login`, `/dashboard/*`, public card `/c/[slug]`. **No `/privacy`, `/terms`, or `/data-deletion` routes exist yet** — these are launch blockers because Play + DPDP require them.

- [ ] 🔴 Create **`/privacy`** (Privacy Policy — DPDP-compliant, see COMPLIANCE §1)
- [ ] 🔴 Create **`/terms`** (Terms of Service, 18+ age gate, acceptable use)
- [ ] 🔴 Create **`/data-deletion`** (public account-deletion instructions + request path; referenced by Play §3.5)
- [ ] 🟡 Add a user **data export** path (DPDP access right) — consider a `/dashboard` export action or `/account/export` endpoint (see COMPLIANCE §1)
- [ ] 🔴 **Security headers** on the Next.js app via `next.config.js` `headers()` or middleware: HSTS, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, and a CSP for `/c/[slug]` (it embeds QR + Open Graph)
- [ ] 🟡 **Analytics/cookie consent** banner if any analytics/ads cookies are set (DPDP consent + EEA visitors of public cards)
- [ ] 🟡 Public card pages (`/c/[slug]`) sanitize all user-generated content (XSS) and set proper `robots`/canonical/OG tags
- [ ] 🟡 `NEXT_PUBLIC_API_URL` / `API_URL` point to the production HTTPS API

---

## 6. Pre-launch QA

- [ ] 🔴 Run the full **[`RUNBOOK.md`](./RUNBOOK.md) click-through** end-to-end against staging (auth → cards → public card/QR → leads → Razorpay test checkout → profile → admin refund/broadcast/settings/impersonation). Note the backend has **not been executed in-repo** (no PHP runtime) — this is the first real integration run, so budget time
- [ ] 🔴 Verify **email delivery** for welcome / lead / payment / announcement (queue worker on)
- [ ] 🔴 Verify **Razorpay** live order → verify → webhook → invoice PDF (and refund path) works end-to-end
- [ ] 🟡 **Load test** the public card viewer (`GET public/cards/{slug}`) and lead/event endpoints (the high-traffic, unauthenticated surface)
- [ ] 🟡 **Accessibility** pass on web (`/`, `/login`, `/c/[slug]`) — contrast, labels, keyboard nav
- [ ] 🟡 **Broken-link / 404** sweep across web (including the new `/privacy`, `/terms`, `/data-deletion`)
- [ ] 🟡 Run automated suites: `cd mobile && npm test` (139), `cd web && npm test` (15) + `npm run build`, `cd backend && php artisan test`
- [ ] 🔵 Test on a low-end Android device + slow network; verify offline/error states

---

## Launch gate — sign-off

Do not promote to production / Play production track until **every 🔴 box** above is checked, with explicit owner sign-off on the **Play Billing decision (§3.7 / COMPLIANCE §4)**.

| Area | Owner | Status |
|---|---|---|
| Security hardening (§1) | | ☐ |
| Backend deployment (§2) | | ☐ |
| Play Store (§3) incl. Billing decision | | ☐ |
| Web legal routes & headers (§5) | | ☐ |
| QA click-through (§6) | | ☐ |

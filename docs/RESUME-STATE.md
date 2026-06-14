# Resume State — where we left off

## ✅ EXECUTED & VERIFIED (2026-06-14) — backend now actually runs
Environment: Laragon PHP 8.3.30 + Composer 2.9 + (SQLite, not MySQL). Enabled `zip` ext in
`C:\laragon\bin\php\...\php.ini`. Backend `.env` set to SQLite
(`database/database.sqlite`), `key:generate` + `jwt:secret` done, `migrate:fresh --seed` OK
(all 26 migrations incl. activity_logs/settings/ads; all 4 seeders).

- **Backend: `php artisan test` → 55 passed** (was 53; +2 regression). Server runs:
  `php artisan serve` on 127.0.0.1:8000 (health /up = 200).
- **Live smoke test passed**: register 201, login 200, /auth/me, /plans (3), create card 201,
  list cards, public card, /ads (enabled), superadmin login, /admin 200, CORS ACAO=* for
  localhost:3000.
- **Mobile: 139 Jest pass. Web: 15 Jest pass + build ✓.**

### 3 pre-existing bugs found by running & fixed
1. `TeamService.php:49` — `$data['role']` undefined when role omitted → `($data['role'] ?? null)`.
2. `RegisterRequest`/`UpdateProfileRequest` — `email:rfc,dns` did a live DNS lookup in the
   signup hot path (flaky, rejects MX-less domains like example.com) → `email:rfc`.
3. `CardRepository::paginateForUser` — used `array_key_exists('is_published',$filters)` as the
   filter condition, but the controller always sets that key (null when absent) → list always
   filtered to drafts, so **published cards never appeared in /cards**. Fixed to null-check;
   added 2 regression tests in CardTest (list includes published; filter by is_published).

To start the server again: `cd backend` then
`& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan serve`.

## Overall progress
- **Backend (Laravel 12): Phases 1–7 COMPLETE** — schema, auth, cards, portfolio/leads/analytics,
  subscriptions+Razorpay+teams, Filament admin, tests/Docker/CI/Swagger/deploy docs.
- **Mobile (React Native): core COMPLETE** — config, API layer (JWT refresh), Zustand stores,
  navigation, 16 screens, components.
- **Razorpay native checkout + payment history: COMPLETE** (mobile).

## Razorpay checkout + payment history — DONE
Earlier groundwork:
- Added `react-native-razorpay` to `mobile/package.json`.
- Added `Payment` + `CheckoutOrder` types to `mobile/src/types/index.ts`.
- Created `mobile/src/api/payments.api.ts` (checkout/verify/history).
- Created `mobile/src/types/react-native-razorpay.d.ts` (type shim).
- Created `mobile/src/services/checkout.ts` (`purchasePlan`, `CheckoutCancelled`).

Finished this turn:
1. `PlansScreen.tsx`: pulls `user` via `useAuthStore(s => s.user)`; `onChoose` now calls
   `purchasePlan(plan, user)`, shows "Subscription activated." + `load()` on success,
   silently returns on `CheckoutCancelled`, shows `apiErrorMessage(e)` otherwise.
   (`subscriptionsApi` kept for `plans()`/`current()`.)
2. Created `mobile/src/screens/profile/PaymentHistoryScreen.tsx` (FlatList over
   `paymentsApi.history()`, status chips, EmptyState). Added `PaymentHistory` to
   `ProfileStackParamList`, registered it in `ProfileStack.tsx`, and added a
   "Payment history" `List.Item` in `ProfileScreen.tsx`.
3. `docs/MOBILE-BUILD.md`: added §4 "Razorpay native checkout linking" (Android ProGuard
   keep-rules, iOS pod/Podfile platform, server-provided key note); renumbered later
   sections; extended the release checklist.

> NOT typechecked here — `mobile/node_modules` is not installed. Run
> `cd mobile && npm install && npm run tsc` once tooling is available.

## Mobile tests (Jest + RNTL) — DONE ✅ (133 tests, 30 suites green; ~92% coverage)
## ALL screens + ALL api wrappers covered.
- `package.json`: added devDeps (`jest`, `@testing-library/react-native`, `react-test-renderer@18.3.1`,
  `babel-jest`, `babel-plugin-module-resolver`, `@types/jest`, `@types/react-test-renderer`) and
  scripts (`test`, `test:watch`, `test:coverage`). Config (`jest.config.js`/`jest.setup.js`) pre-existed.
- Added `src/test-utils/render.tsx` (`renderWithProviders` wraps PaperProvider + SafeAreaProvider,
  stubs Paper icons via `settings={{icon}}`; re-exports RNTL). Excluded `src/test-utils/**` from coverage.
- Tests (9 suites): `utils/format`, `utils/storage`, `components/ui/EmptyState`,
  `components/CardListItem`, `components/NotificationItem`, `services/checkout`,
  `store/notification.store`, `store/auth.store`, `api/client` (incl. the 401-refresh
  interceptor via a mock axios adapter, and `apiErrorMessage`),
  `screens/auth/LoginScreen` (render, trimmed-email submit, error display, navigation),
  `screens/auth/RegisterScreen` (render, password-mismatch guard, trimmed submit with
  phone omitted/included, error display, navigation),
  `screens/profile/PlansScreen` (lists plans + Current chip + Upgrade gating, purchase
  success/activation+reload, CheckoutCancelled silence, purchase error). Mocks
  `useFocusEffect` to fire load on mount; keeps real `CheckoutCancelled` via requireActual.
  `screens/cards/CardListScreen` (empty state, row-per-card, tap-card → editor with id,
  FAB → blank editor). FAB pressed via its stubbed "plus" icon text (event bubbles to onPress).
  `screens/profile/PaymentHistoryScreen` (empty state, amount/plan/invoice/status row,
  transaction-id fallback when no invoice, row-per-payment).
  `screens/notifications/NotificationScreen` (fetch-on-mount + empty state, row-per-item,
  "Mark all as read" gated on unreadCount + wired to markAllRead, tap→markRead,
  close→remove). Mocks the whole `useNotificationStore()` with a mutable state object.
  `screens/leads/LeadListScreen` (empty state, lead details + "New" chip, tap-unread→markRead
  + chip drops, tap-read→no API, searchbar submit→list({search})).
  `screens/auth/ForgotPasswordScreen` (render, trimmed-email submit + API message,
  empty-message fallback, error display, goBack).
  `screens/profile/ChangePasswordScreen` (password-mismatch guard→snackbar+no API,
  success→changePassword payload + goBack, API error→snackbar + stays).
  `screens/profile/EditProfileScreen` (prefill from store user, save trimmed→updateProfile
  + setUser + goBack, API error→snackbar + stays).
  `screens/profile/ProfileScreen` (name/email header, each List.Item → navigate target,
  Log out → logout()).
  `screens/dashboard/DashboardScreen` (first-name greeting + 'there' fallback, daily
  analytics + card-count stats rendered, summary('daily') called on mount).
  `screens/cards/QrShareScreen` (name/URL render, Share link, Share QR via mocked
  qrcode-svg getRef→toDataURL base64 PNG, cancellation swallowed). Mocks
  react-native-share + react-native-qrcode-svg.
  `screens/cards/CardEditorScreen` (create: Create disabled until name → create+setParams+snack;
  edit: load+prefill+update+snack, Delete via Alert.alert button onPress→remove+goBack,
  duplicate→replace, Share/QR→navigate, social-link delete→removeSocialLink+row drops).
- API wrapper unit tests (mock `@/api/client`'s `api`, assert URL/params/payload + that
  `data.data` is unwrapped): `cards.api`, `auth.api` (note forgotPassword returns
  `data.message`), `analytics.api`, `leads.api`, `notifications.api`, `payments.api`,
  `subscriptions.api`.
- Coverage now ~92% stmts overall (services/utils/components 100%, store ~91%, api high).
- Fixed the Paper "no icon libraries installed" warning at the source: the
  `react-native-vector-icons/MaterialCommunityIcons` mock now exposes `.default` so Paper's
  `loadIconModule()` (used by Searchbar etc.) doesn't fall back to its warning component.
- `jest.setup.js` now enables fake timers globally (beforeEach useFakeTimers /
  afterEach runOnlyPendingTimers+useRealTimers) to flush Paper's Animated/Snackbar
  timers on teardown and silence "...after it has been torn down" warnings. RNTL
  advances fake timers inside waitFor/findBy, so async assertions are unaffected.
- Added `mobile/.gitignore` (node_modules, coverage, native build dirs, .env).
- Verified on this machine: `npm install --legacy-peer-deps` then `npm test` → 43 passed.
- Coverage on tested units: client.ts/services/utils/components 100% stmts, stores ~91%.
  Overall ~23% (screens + most api/*.ts modules still untested — see follow-ups).

### Pre-existing issues fixed while wiring up Jest
- `jest.config.js` `transformIgnorePatterns` had an unbalanced-paren regex → `Invalid regular
  expression`. Rewrote to a balanced equivalent.
- `babel.config.js` used `module-resolver` but `babel-plugin-module-resolver` was never in
  `package.json`. Added it.
- `react-native-screens` was `^4.5.0` (floated to 4.25.2, which needs RN ≥0.82). Pinned to `~4.5.0`.
  NOTE: install still needs `--legacy-peer-deps` (RN 0.76 + RN-screens/navigation peer ranges).

## Super-admin admin panel (web/Filament) — DONE ✅ (authored; no PHP runtime to run)
Extended the existing Filament `/admin` panel (web-only; nothing added to mobile).
- **Super-admin tier:** `User::isSuperAdmin()` (role `super_admin`); `canAccessPanel` now
  `($is_admin || isSuperAdmin()) && active`. `RolePermissionSeeder` adds `super_admin` role
  + new permission groups (access/plans/audit/settings); super admin → all perms, admin →
  all except `roles.manage`/`permissions.manage`/`plans.manage`/`settings.manage`.
  `AdminUserSeeder` seeds a super admin (`SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD`,
  defaults superadmin@dcard.app / Super@12345).
- **Gating trait:** `app/Filament/Concerns/SuperAdminOnly.php` (`canAccess`/`canViewAny`).
- **New resources:** `RoleResource` (+ManageRoles) — roles + permission checkbox list,
  protected built-in roles; `PermissionResource` (+ManagePermissions); both super-admin only.
  `ActivityLogResource` (+ListActivityLogs) — read-only audit trail, action/date filters, CSV.
- **Audit log:** migration `2025_01_01_000021_create_activity_logs_table.php` + `ActivityLog`
  model with `record($action,$subject?,$desc?,$props?)` (actor + IP). Logged from privileged
  UserResource/RoleResource actions.
- **Gated `SubscriptionPlanResource`** to super admin (uses the trait).
- **UserResource enhancements:** roles multiselect + role column/filter (super-admin only for
  editing), Suspend/Activate now audited, **Make/Revoke super admin** action (audited),
  delete (row + bulk) restricted to super admins.
- **Widget:** `SuperAdminStatsWidget` (super-admin only) — admin/super-admin/suspended/role/
  permission counts + 24h audit events. Auto-discovered by `AdminPanelProvider`.
- Docs: `docs/ADMIN-PANEL.md` updated (tiers, Access Control/System groups, audit log, creds).
- NOT executed here (no PHP/Composer). To verify: `cd backend && composer install &&
  php artisan migrate --seed && php artisan serve` → `/admin`. New resources/widgets are
  auto-discovered (no provider edit needed).

## Admin panel — power features (web/Filament) — DONE ✅ (authored; no PHP to run)
Four features added on top of the super-admin panel:
1. **App Settings** — `settings` table (`2025_01_01_000022`) + `Setting` model (cached
   get/set) + `SettingSeeder` (in DatabaseSeeder). Filament `ManageSettings` page
   (`resources/views/filament/pages/manage-settings.blade.php`), super-admin only:
   app_name, maintenance mode, signups on/off, announcement banner, support email/url.
   Wired: `EnsureNotInMaintenance` middleware (appended to api group, allows `auth/*`) +
   `signups_enabled` enforced in `AuthService::register`.
2. **Razorpay refunds** — `RazorpayService::refund()`; PaymentResource **Refund** action
   (gated super-admin/`payments.refund`, modal w/ reason) → flips status, notifies user
   (new `NotificationType::PaymentRefunded`), audits. Helper `PaymentResource::canRefund`.
3. **Broadcast announcements** — `BroadcastAnnouncement` page (super-admin) + view; audience
   All/Premium/Business/Admins; in-app (`NotificationType::Announcement`) and/or queued
   `AnnouncementMail` (+ `emails/announcement.blade.php`); chunked; audited w/ count.
4. **Impersonation** — UserResource **Impersonate** action (super-admin, not on other super
   admins): issues 15-min JWT w/ `impersonated_by` claim via `JWTAuth`, shows token in a
   persistent notification, audited.
- `.env.example`: added ADMIN_/SUPERADMIN_ seed credentials.
- Docs: `docs/ADMIN-PANEL.md` updated. NOT executed (no PHP). Verify via
  `php artisan migrate --seed` then the panel.

## Mobile UI/UX overhaul (professional + user-friendly) — DONE ✅ (139 tests green)
- Used the ui-ux-pro-max skill → flat professional indigo system (primary #6366F1,
  emerald accent, Poppins/Open-Sans personality, 150–200ms motion).
- Rebuilt `src/theme/index.ts`: `palette` scale, semantic `colors` (+success/warning/
  info/textSecondary/onPrimary), `spacing`, `radius`, `elevation`, MD3 `configureFonts`
  (bolder headings), and a `darkTheme`/`darkColors`. Kept `colors`/`spacing`/`theme`
  exports stable so all tests/components keep working.
- Polished `EmptyState` (icon-in-circle), `LoadingView` (+message), `CardListItem`
  (bordered card, avatar tint, chevron, tonal chips), `NotificationItem` (icon circle +
  unread dot). New `ErrorState` and `StatusBadge` (+`toneForStatus`) shared components.
- Test-stability fix: `jest.setup.js` afterEach now `clearAllTimers()` (discard) instead
  of `runOnlyPendingTimers()` — eliminates a flake where Paper elevation Animated timers
  bled across tests. Verified 3× green.

## Ads placements (admin-controlled) — DONE ✅ (authored; mobile tested)
Decisions: house ads + **AdMob fallback**, placements dashboard_top/card_list/leads_top/
app_footer, **free users only**, dedicated Ads model.
- Backend: `ads` table (`2025_01_01_000023`) + `Ad` model (active/placement/audience
  scopes); `AdService` (free-only rule via active paid subscription check; per-placement
  house ad + AdMob config); `AdController` (`GET /ads`, `POST /ads/{ad}/track`) wired in
  routes; Filament `AdResource` (Marketing group) with image upload, schedule, priority,
  impressions/clicks/CTR; ads settings (ads_enabled, admob_enabled, admob unit ids) in
  `SettingSeeder` + `ManageSettings` "Ads" section.
- Mobile: `Ad`/`AdsPayload` types, `ads.api.ts`, `ads.store.ts` (fetch-once), `AdSlot`
  (house ad → AdMob → nothing; impression on view, click+Linking on tap), guarded
  `AdMobBanner` (lazy require, no-op without SDK). Wired into Dashboard, CardList (list
  header), Leads (under searchbar), and a global footer via custom tab bar in AppTabs.
  Added `react-native-google-mobile-ads` dep; jest.setup mocks the SDK + ads store
  (disabled by default so screen tests stay network-free). New tests: `ads.api` (2),
  `AdSlot` (4). Suite: 32 suites / 139 tests green.
- NOT run for backend (no PHP) and AdMob native not built (needs SDK install + native
  config). Verify backend via migrate --seed; mobile via npm test (done).

## Marketing website (Next.js + Tailwind) — DONE ✅ (builds clean)
- New `web/` project: Next.js 14 App Router + Tailwind, design tokens ported from the app
  (`tailwind.config.ts`: indigo #6366F1, emerald accent, slate, Poppins/Open Sans).
- Landing page (`app/page.tsx`) sections in `web/components/`: Navbar, Hero (+ CSS phone
  CardMockup), Stats, Features (inline SVG icons), HowItWorks, Pricing (real plans
  Free/Premium/Business from seeder), Faq (native <details>), CtaBand, Footer. Copy in
  `lib/site.ts`. UI primitives in `components/ui/`.
- Verified: `cd web && npm install` (done) + `npm run build` → ✓ compiled, 4 static pages.
- Marketing landing built first.

## Public card viewer (web `/c/[slug]`) — DONE ✅ (builds clean)
- SSR page off `GET ${API_URL}/public/cards/{slug}` (`lib/card.ts`, memoised via React
  `cache()` so generateMetadata + page hit backend once; `force-dynamic` so each visit
  records a view). `API_URL` env (`.env.example`), defaults to localhost:8000/api/v1.
- `components/card/PublicCardView` (server) renders header/avatar, quick actions
  (call/WhatsApp/email/website), about, contact details, social links, services, portfolio.
  Client bits: `SaveContactButton` (vCard download) + `CopyLinkButton`. `not-found.tsx`
  for unpublished/missing. Per-request Open Graph + Twitter metadata for rich previews.
- Verified: `npm run build` → ✓ compiled; `/c/[slug]` = ƒ dynamic, `/` static.

## Web dashboard (JWT, client-rendered) — DONE ✅ (builds clean)
- `lib/auth.ts` (token in localStorage), `lib/api-client.ts` (attaches JWT, unwraps
  `{data}`, 401 → clear + redirect /login), `lib/types.ts`.
- `/login` (POST /auth/login → store token), guarded `app/dashboard/layout.tsx` + Sidebar.
- Pages: `/dashboard` overview (me + analytics summary + card count), `/dashboard/cards`
  (list + views + View-public link + Draft badge), `/dashboard/leads` (list + mark-read).
- Navbar "Log in" → /login. Env: `NEXT_PUBLIC_API_URL` (browser) added to `.env.example`.
  Note: backend CORS must allow the web origin.
- Verified: `npm run build` → ✓ no warnings (fixed themeColor → viewport export).

## Web: card create/edit + QR on public card — DONE ✅ (builds clean, 9 routes)
- QR: added `qrcode` dep; `lib/qr.ts` (`qrDataUrl`) generates a PNG data URL server-side;
  `/c/[slug]` passes it to `PublicCardView` which renders a "Scan to connect" QR + download.
- Card forms: `components/dashboard/CardForm` (create/edit via POST/PUT /cards);
  `/dashboard/cards/new`, `/dashboard/cards/[id]/edit` (loads card, edit, **delete**);
  cards list now has "New card" + per-card "Edit". Uses CardResource fields.
- Verified: `npm run build` → ✓ 9 routes compile.

## Web: dashboard profile + plans — DONE ✅ (builds clean, 11 routes)
- `/dashboard/profile`: edit name/phone/email (`PUT /profile`) + change password
  (`PUT /password`, sends password_confirmation; client-side match check too).
- `/dashboard/plans`: `/plans` + `/subscription`, current plan highlighted; upgrade CTA
  points to app (#download) since Razorpay checkout is native. Types: Plan, CurrentSubscription.
- Sidebar nav extended (Plans, Profile). Verified: `npm run build` → ✓ 11 routes.

## Web: avatar upload + social links editor — DONE ✅ (builds clean, 11 routes)
- `lib/api-client.ts`: added `apiUpload()` (FormData, no Content-Type, leaves boundary to
  browser). Profile page: avatar upload via POST /profile with `_method=PUT` + `avatar`
  file (PHP can't parse multipart PUT), shows current avatar/initials.
- `components/dashboard/SocialLinksEditor` on the card edit page: list/add/remove links
  (`GET/POST /cards/{id}/social-links`, `DELETE /social-links/{id}`); platform options from
  the SocialPlatform enum. Added `SocialLink` + `User.avatar` to web types.
- Verified: `npm run build` → ✓ compiles.

## Web: services + portfolio editors — DONE ✅ (builds clean)
- `ServicesEditor` (JSON): list/add/remove `/cards/{id}/services`, `DELETE /services/{id}`.
- `PortfolioEditor` (multipart via apiUpload): list/add/remove `/cards/{id}/portfolio`,
  `DELETE /portfolio/{id}`; type select (image/video/pdf/brochure/catalog); image thumbs;
  plan-gated server-side (shows 403 message). Types Service/PortfolioItem added to lib/types.
- Both wired into the card edit page (alongside social links). Verified: `npm run build` → ✓.

## Web: card photo upload — DONE ✅
- `CardPhotoUploader` on the card edit page: multipart upload to `/cards/{id}` with
  `_method=PUT` + `profile_photo` (image ≤2MB), shows current photo/initials. Added
  `Card.profile_photo` to web types. Verified: `npm run build` → ✓.

## Web: test harness + lib tests — DONE ✅ (9 tests green)
- Added Jest via `next/jest` (jsdom), `npm test` script, `jest.config.js` (@/ mapping).
- Extracted `lib/vcard.ts` (`buildVCard`) from SaveContactButton; tests cover fields,
  omission, address newline-flatten, CRLF.
- Tests (5 suites / 15): `vcard` (build/omit/CRLF), `api-client` (envelope/auth/ApiError),
  `razorpay` (checkout→verify + CheckoutCancelled, mocked SDK), `card` (getPublicCard
  ok/404/throw), `qr` (PNG data URL, @jest-environment node). `npx jest` → 15 pass; build ✓.
- `lib/card.ts`: `cache` now falls back to passthrough when React.cache is absent (Jest/plain
  React) — keeps SSR dedup under Next, testable elsewhere.
- This is executed verification of the web's core logic (UI/data-flow still compile-only).

## Web: Razorpay web checkout — DONE ✅ (builds clean)
- `lib/razorpay.ts`: loads Razorpay checkout.js, `purchasePlan(plan, prefill)` →
  `/subscriptions/checkout` → Razorpay modal → `/payments/verify`; `CheckoutCancelled` on
  dismiss. Plans page "Upgrade to X" button (busy/success states, reload on success,
  prefill from /auth/me). Mirrors mobile checkout.ts.
- Verified: `npm run build` → ✓.
- Open (web): card profile-photo upload; inline edit of child items. Otherwise web is
  feature-complete vs the app.
- ⚠ NOTHING in backend/web has been run against a live API (no PHP runtime). Web `npm run
  build` passes (compile + types); data flows unverified end-to-end. Recommended next:
  stand up backend (`composer install && php artisan migrate --seed && php artisan serve`)
  + `cd web && npm run dev`, set NEXT_PUBLIC_API_URL/API_URL + backend CORS, smoke-test.

## End-to-end runbook — DONE ✅
- `docs/RUNBOOK.md`: full stand-up guide (backend migrate --seed + serve + queue/scheduler,
  CORS, mobile, web env) + a 17-step click-through verification (auth → cards → photo/social/
  services/portfolio → public card + QR → leads → Razorpay upgrade → profile → admin: refund,
  ads, broadcast, settings, roles, impersonation) + troubleshooting. Linked from root README.
- Verified env names against repo: mobile `API_BASE_URL`, backend `APP_FRONTEND_URL`
  (defaults to the web app at :3000, used in emails).

## Optional follow-ups still open (flagged earlier)
- Generate `mobile/android` + `mobile/ios` native template folders (via RN CLI init).
- ALL 14 screens + ALL 8 api wrappers + components/stores/services/utils now have tests.
  Mobile test coverage is comprehensive (~92%). Nothing outstanding on the mobile-tests
  front. Untested-by-design: navigation wiring (RootNavigator/stacks/tabs), App.tsx,
  theme — pure config/composition with no logic.
- Backend: run `composer install && php artisan test` to confirm green (no PHP runtime here).

## Environment notes
- Windows; no PHP/Composer installed (backend not executed, only authored).
- Node v22 present; mobile not built (needs Android Studio/Xcode + `npm install`).

# Admin Panel (Filament)

The admin panel is a Filament v3 panel mounted at **`/admin`**, separate from the
JWT REST API. It authenticates against the `web` (session) guard. It is **web only** —
it cannot run inside the React Native app (it relies on session + CSRF), and there is
deliberately no admin code in `mobile/`.

Access is granted to **any active admin or super admin** (see `User::canAccessPanel()`):

```php
return ($this->is_admin || $this->isSuperAdmin()) && $this->isActive();
```

Two privilege tiers:

| Tier | Flag / role | Scope |
|------|-------------|-------|
| **Admin** | `is_admin = true` (role `admin`) | Users, Cards, Leads, Payments, Subscriptions, CMS, view audit log |
| **Super admin** | role `super_admin` | All of the above **plus** Subscription **Plans**, **Roles**, **Permissions**, grant/revoke super admin, delete users |

Super-admin-only screens use the `App\Filament\Concerns\SuperAdminOnly` trait
(`canAccess()` / `canViewAny()` → `isSuperAdmin()`), so they are hidden from navigation
and route-guarded for regular admins.

## Setup

```bash
composer install
php artisan migrate --seed          # seeds the admin user (see .env ADMIN_EMAIL/PASSWORD)
php artisan filament:assets         # publish Filament JS/CSS
php artisan storage:link            # serve uploaded images/banners
```

Default credentials (override in `.env` before seeding):

```
ADMIN_EMAIL=admin@dcard.app           ADMIN_PASSWORD=Admin@12345
SUPERADMIN_EMAIL=superadmin@dcard.app  SUPERADMIN_PASSWORD=Super@12345
```

Log in at `http://localhost:8000/admin`.

## Dashboard

| Widget | Shows |
|--------|-------|
| `StatsOverviewWidget` | Total/active users, premium & business users, revenue, active/expired subscriptions, total cards, total leads |
| `SuperAdminStatsWidget` *(super admin only)* | Admin & super-admin counts, suspended users, roles & permissions, audit events in the last 24h |
| `RevenueChartWidget` | Paid revenue over the last 12 months (line) |
| `UserGrowthChartWidget` | New users over the last 12 months (bar) |

## Resources & navigation groups

**Users**
- `UserResource` — list/search/filter (status + role), view (cards & leads counts), edit, **suspend/activate** (audited), **Export CSV**.
- *Super admin only:* assign RBAC roles, **Make/Revoke super admin** (audited), **Impersonate** (issues a 15-min JWT with an `impersonated_by` claim, audited), delete users (single + bulk).

**Access Control** *(super admin only)*
- `RoleResource` — create/edit roles, attach permissions via grouped checkbox list.
  Built-in roles (`super_admin`/`admin`/`user`/`manager`) can't be renamed or deleted.
- `PermissionResource` — manage the permission catalogue, grouped by module.

**System**
- `ActivityLogResource` — read-only, append-only audit trail of privileged actions
  (status changes, super-admin grants, role create/delete, refunds, broadcasts, settings,
  impersonation), filterable by action/date, **Export CSV**.
- **App Settings** (`ManageSettings` page, super admin) — `app_name`, **maintenance mode**
  (API returns 503 except auth routes — `EnsureNotInMaintenance` middleware), **signups
  on/off** (enforced in `AuthService::register`), announcement banner, support email/URL.
  Stored in `settings` (key/value, cached); read via `Setting::get($key, $default)`.
- **Broadcast Announcement** (`BroadcastAnnouncement` page, super admin) — send an in-app
  notification and/or queued email to **All / Premium / Business / Admins**. Audited with
  recipient count.

**Marketing**
- `AdResource` — admin-controlled **ad placements** for the mobile app. Each ad has a
  placement (`dashboard_top`, `card_list`, `leads_top`, `app_footer`), audience, image,
  tap-through link, schedule window, priority, and live **impressions / clicks / CTR**.
  Master switch + AdMob fallback config live under **App Settings → Ads**. Only **free
  users** see ads (premium/business are ad-free, enforced server-side in `AdService`).
  Mobile renders a house ad if one exists for the slot, else an AdMob banner, else nothing.

**Billing**
- `SubscriptionPlanResource` *(super admin only)* — full CRUD of Free/Premium/Business plans (price, limits, features, enable/disable).
- `PaymentResource` — adds a **Refund** action (gated to super admin or `payments.refund`):
  calls `RazorpayService::refund()`, flips status to `refunded`, notifies the user
  (`payment_refunded`), and audits with an internal reason.
- `SubscriptionResource` — view/filter all subscriptions (active/expired/cancelled), Export CSV.
- `PaymentResource` — view/search/filter transactions, **download invoice**, Export CSV. (Read-only; refunds tracked via `status`.)

**Content**
- `CardResource` — view/search all cards (read-only), Export CSV.
- `LeadResource` — view/search all leads (read-only), Export CSV.

**CMS**
- `FaqResource`, `PageResource` (terms/privacy/about), `HelpArticleResource`,
  `BannerResource` (promotional banners), `CardTemplateResource` — all full CRUD (modal-based).

## Role-Based Access Control

```
User ─< role_user >─ Role ─< permission_role >─ Permission
```

- Panel entry is gated by `User::canAccessPanel()`; the privileged screens above are
  gated by the `SuperAdminOnly` trait.
- Roles seeded by `RolePermissionSeeder`: `super_admin`, `admin`, `user`, `manager`.
  - **Super admin** → every permission.
  - **Admin** → every permission **except** `roles.manage`, `permissions.manage`,
    `plans.manage`, `settings.manage`.
- Permission catalogue is grouped by module (`users`, `subscriptions`, `payments`,
  `content`, `templates`, `reports`, `access`, `plans`, `audit`, `settings`).

## Audit log

`ActivityLog::record($action, $subject?, $description?, $properties?)` appends a row
(actor = `auth()->id()`, plus request IP) to `activity_logs`. It's called from the
privileged Filament actions and surfaced read-only via `ActivityLogResource`.

## Reporting / Exports

Every list page exposes an **Export CSV** header action that streams the *currently
filtered* result set (users, payments, subscriptions, cards, leads). For richer
Excel exports, `maatwebsite/excel` is installed and can back dedicated report exporters.

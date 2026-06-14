# Template Marketplace, Reward Wallet & Referrals — Integration Guide

This feature set is **purely additive**. No existing modules were rebuilt and the
existing card-creation flow is unchanged. It follows the established architecture:
`Route → FormRequest → Controller → Service → Repository`, Eloquent models with
`casts()`, backed string enums, Filament resources, and the React Native
`api → store/screen` pattern.

---

## 1. What was added

### Backend (`backend/`)

**Enums** (`app/Enums/`)
- `TemplateUnlockMethod` (`free|points|money|mixed`)
- `TemplatePurchaseStatus` (`pending|completed|failed`)
- `RewardTransactionType` (`credit|debit`)
- `RewardSource` (`referral|signup_bonus|promotional|admin|template_redemption|adjustment`)

**Migrations** (`database/migrations/2025_02_01_*`) — new tables only, plus two additive columns:
- `template_categories`, `templates`, `template_purchases`
- `reward_wallets`, `reward_transactions`, `reward_settings`, `referrals`
- `users.referral_code`, `users.referred_by` (additive)
- `cards.template_id` (additive — the applied marketplace template; the existing
  `card_template_id` is left untouched)

**Models** (`app/Models/`) — `TemplateCategory`, `Template`, `TemplatePurchase`,
`RewardWallet`, `RewardTransaction`, `RewardSetting`, `Referral`. `User` and `Card`
gained relationships only.

**Repositories** — `TemplateRepository` (+ interface), bound in `RepositoryServiceProvider`.

**Services** (`app/Services/`)
- `TemplateService` — browse/preview (annotates `is_unlocked` per user) + apply-to-card
- `TemplatePurchaseService` — unlock via free/points/money/mixed, reusing `RazorpayService`
- `RewardService` — wallet credit/debit/redeem with a full ledger
- `ReferralService` — code generation, signup attribution, referrer rewards

**HTTP** — Form Requests under `Http/Requests/{Template,Reward}`, API Resources under
`Http/Resources/V1`, controllers `TemplateController`, `RewardController`,
`ReferralController`. Routes added to `routes/api.php` (authenticated group).

**Seeders** — `TemplateCategorySeeder` (11 categories), `TemplateSeeder` (20 templates),
`RewardSettingSeeder`; registered in `DatabaseSeeder`. `rewards.manage` permission added
to `RolePermissionSeeder`.

**Filament** (`app/Filament/`) — `TemplateResource`, `TemplateCategoryResource`,
`RewardWalletResource` (with add/deduct-points actions), `RewardTransactionResource`,
`ReferralResource`, `ManageRewardSettings` page, and dashboard widgets
(`MarketplaceStatsWidget`, `TopTemplatesChartWidget`, `ReferralGrowthChartWidget`).
All are auto-discovered by the panel — no registration needed.

### Mobile (`mobile/`)
- Types in `src/types/index.ts`
- API modules `src/api/{templates,rewards,referrals}.api.ts`
- `unlockTemplate()` added to `src/services/checkout.ts` (reuses Razorpay)
- Screens: `screens/templates/{TemplateMarketplaceScreen,TemplateDetailScreen}`,
  `screens/rewards/RewardWalletScreen`, `screens/referrals/ReferralScreen`
- Navigation: new `Templates` tab (`MarketplaceStack`); `RewardWallet` + `Referrals`
  added to `ProfileStack`; Profile screen links added
- Registration now accepts an optional **referral code**

---

## 2. Install / run steps

```bash
cd backend
php artisan migrate          # creates the 7 new tables + 2 additive columns
php artisan db:seed          # seeds categories, 20 templates, reward settings, permissions
# (or run only the new seeders)
php artisan db:seed --class=TemplateCategorySeeder
php artisan db:seed --class=TemplateSeeder
php artisan db:seed --class=RewardSettingSeeder
php artisan db:seed --class=RolePermissionSeeder
php artisan storage:link     # if not already linked — template images use the public disk
```

Existing users created before this feature get a wallet + referral code **lazily** on
first use (`RewardService::walletFor()` / `ReferralService::ensureCode()`), so no backfill
is required. To backfill eagerly you may run a one-off `tinker` loop if desired.

### Environment

Optional — controls the referral link base (falls back to `APP_URL`):

```
APP_REFERRAL_BASE_URL=https://app.dcard.com   # produces https://app.dcard.com/ref/DCXXXXXX
```

Razorpay credentials are reused from the existing `config/services.php`
(`services.razorpay.key|secret`) — no new gateway config.

---

## 3. API endpoints (all under `/api/v1`, JWT `auth:api`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/templates/categories` | List active categories |
| GET | `/templates` | Browse (filters: `category_id`, `category`, `is_free`, `search`) — each item has `is_unlocked` |
| GET | `/templates/mine` | The user's unlocked templates |
| GET | `/templates/{template}` | Template detail |
| POST | `/templates/{template}/unlock` | Body `{method}` → completes (free/points) or returns a Razorpay order (money/mixed) |
| POST | `/templates/verify` | Confirm a money/mixed unlock `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` |
| POST | `/templates/{template}/apply` | Body `{card_id}` — apply an unlocked template to a card |
| GET | `/rewards/wallet` | Balance + lifetime totals |
| GET | `/rewards/transactions` | Points ledger |
| POST | `/rewards/redeem` | Body `{points, description?}` |
| GET | `/referrals` | Dashboard: code, link, totals, referral list |
| GET | `/referrals/history` | Paginated referrals |

Registration (`POST /auth/register`) now accepts an optional `referral_code`.

### Unlock flow (money / mixed)
1. `POST /templates/{id}/unlock` with `{method: "money"}` → returns `{requires_payment: true, order, razorpay_key}`.
2. Client opens Razorpay Checkout with the order.
3. `POST /templates/verify` with the Razorpay response → marks the purchase `completed`
   (and debits reserved points for `mixed`). Mirrors the subscription checkout exactly.

Free and `points` unlocks complete in the single `unlock` call (`requires_payment: false`).

---

## 4. Admin (Filament) — no developer needed

- **Marketplace → Templates**: create/edit/delete templates, upload a thumbnail and
  multiple preview images, set the category, money price (₹), reward-points price,
  free/active toggles. Activate/deactivate inline from the table.
- **Marketplace → Categories**: add unlimited categories.
- **Rewards → Reward Settings**: change referral points, signup bonus, promotional
  points, minimum-redeem and the points→₹ rate. Saved values take effect immediately.
- **Rewards → User Wallets**: view balances; **Add points** / **Deduct points** per user.
- **Rewards → Point Transactions** and **Referrals**: read-only audit views with filters.
- **Dashboard widgets**: points distributed/redeemed, template revenue, unlocks, most
  purchased templates, and referral growth.

---

## 5. Unlock methods recap

A template can be unlocked with any method its pricing supports:

| Template pricing | Methods offered |
|------------------|-----------------|
| `is_free` (or price 0 + points 0) | Free (instant) |
| points only | Points |
| money only | Money (Razorpay) |
| money **and** points | Money, Points, **or** Money + Points (`mixed`) |

For `mixed`, wallet points are converted at the admin-set `points_to_inr_rate`, applied as
a discount, and only the remaining balance is charged. Points are debited at verify time so
they are never lost on a cancelled payment.

---

## 6. Architectural decision: new `templates` vs existing `card_templates`

The existing `card_templates` table is a lightweight visual-preset table used directly by
card creation. The marketplace needs categories, dual pricing, purchases, previews and
per-user lock state, so it lives in a **separate `templates` entity**. Cards reference an
applied marketplace template via the new nullable `cards.template_id`
(`Card::marketplaceTemplate()`), leaving `card_template_id` and the existing flow untouched.

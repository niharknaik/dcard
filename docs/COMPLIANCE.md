# DCard — Compliance Guide (India + Google Play)

Product: **DCard**, a product of **COPG Global**. Market: **India**. Surfaces: Laravel 12 API + Filament admin (`backend/`), Next.js web (`web/`), React Native Android app (`mobile/`). Payments: **Razorpay**.

This guide maps legal/policy obligations to **concrete actions in this codebase**. It is operational guidance, not legal advice — have counsel review the privacy policy, ToS, and the Play Billing decision (§4). Companion: [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md), [`RETENTION-POLICY.md`](./RETENTION-POLICY.md), [`INCIDENT-RESPONSE.md`](./INCIDENT-RESPONSE.md).

Suggested contacts to standardize across all docs/pages:
- Grievance Officer / DPO: **info@copg.in**
- Support: **info@copg.in**

---

## 1. India DPDP Act 2023 (Digital Personal Data Protection Act)

DCard collects personal data (name, email, phone, photos, lead-capture data from card visitors) and so acts as a **Data Fiduciary**. Card owners who collect visitor leads are arguably fiduciaries too — DCard provides them the tooling and should pass consent obligations through (see lead capture §5).

| Obligation | What DCard must do | Concrete action in this app |
|---|---|---|
| **Notice & consent** | Clear notice at/ before collection; consent freely given, specific, informed, unambiguous | Privacy policy at **`/privacy`** (web — not yet built); consent checkbox at registration (`POST /auth/register`) and on the public **lead form** (`POST public/cards/{slug}/leads`) |
| **Purpose limitation** | Use data only for the stated purpose | Document purposes (account, card hosting, leads, billing, in-app notifications, analytics) in the policy; no repurposing for unrelated marketing without fresh consent |
| **Data minimization** | Collect only what's necessary | Avoid optional fields you don't use; strip EXIF/geo from uploaded photos; don't log PII |
| **Security safeguards** | Reasonable technical & organizational measures | HTTPS/HSTS, JWT auth, rate limiting, private R2 + signed URLs, RBAC in Filament, encrypted transit (see LAUNCH-CHECKLIST §1) |
| **Breach notification** | Notify the Data Protection Board and affected principals on a personal-data breach | Have an incident-response runbook + the Grievance Officer as point of contact; wire error monitoring (Sentry) to detect |
| **Grievance Officer** | Appoint and publish contact; respond within statutory timelines | Publish **info@copg.in** in `/privacy`, the app, and store listing; log and track grievances |
| **Data principal rights** | Access, correction, erasure, grievance redressal, nominate | Access/export → add **`/account/export`** endpoint or dashboard export; correction → `PUT /v1/profile`; erasure → **`DELETE /v1/account`** (exists) + public **`/data-deletion`** page |
| **Consent withdrawal** | As easy to withdraw as to give | In-app/web account settings to withdraw consent / delete account; stop processing on withdrawal |
| **Retention limits** | Erase when purpose served / consent withdrawn | Define a retention policy: delete on account deletion **except** records required by law (invoices/tax — see §3); document retained categories on `/data-deletion` |
| **Children's data (<18)** | Verifiable parental consent; no tracking/targeted ads to children | **DCard is an 18+ product** (see §5 age gating). Enforce 18+ at signup and in ToS so the children's-data regime does not apply; do not knowingly onboard minors |

**Action items**
- [ ] 🔴 Publish a DPDP-aligned **Privacy Policy** at `/privacy` (purposes, data types, retention, rights, Grievance Officer)
- [ ] 🔴 Appoint & publish the **Grievance Officer** (`info@copg.in`)
- [ ] 🔴 Implement **data export** (access right) and confirm **`DELETE /v1/account`** + public `/data-deletion` satisfy erasure
- [ ] 🔴 Add **consent capture** at registration and on the public lead form
- [ ] 🟡 Write the **retention policy** and a **breach-response** runbook

---

## 2. Payments & RBI (Razorpay)

- **PCI-DSS**: Razorpay is the PCI-DSS-compliant gateway. DCard **does not store card data** — checkout uses Razorpay orders (`subscriptions/checkout`, `templates/{id}/unlock`) and verifies signatures (`payments/verify`, webhook `payments/webhook`). We persist only `transaction_id` / `invoice_number` (see `InvoiceService`). Keep it that way; never log full payment payloads.
- **RBI card tokenization**: card-on-file tokenization is handled entirely by Razorpay; DCard stores no PAN/tokens. No action beyond using Razorpay's hosted/SDK checkout.
- **Recurring payments / e-mandate (auto-debit)**: DCard sells **subscriptions** (Premium/Business). If these auto-renew, RBI's e-mandate framework applies — mandate registration, the **pre-debit notification (≥24h)**, per-transaction limits, and customer ability to cancel. Use **Razorpay Subscriptions / e-mandate** APIs for any auto-renewal; do not roll your own recurring charge.
  - Note: the current flow looks like **one-time order + verify** per purchase. If you keep manual (non-auto) renewals, e-mandate rules largely don't apply — but the ToS/UI must make clear there is **no auto-debit**. Decide explicitly.

**Action items**
- [ ] 🔴 Decide auto-renew vs manual renewal; if auto-renew, implement via Razorpay e-mandate with the 24h pre-debit notice
- [ ] 🔴 Confirm no card data is stored or logged anywhere (DB, logs, Sentry)
- [ ] 🟡 Surface clear cancellation & refund terms (refunds already exist in admin)

---

## 3. GST / Invoicing

DCard issues invoices via `backend/app/Services/InvoiceService.php` → `resources/views/invoices/invoice.blade.php`. The current template carries only `invoice_number` and `transaction_id` — it is **not GST-compliant**.

A GST tax invoice for a registered supplier must include: supplier **legal name + GSTIN + address**, invoice number & date, **HSN/SAC code** (SAC for SaaS services), **taxable value**, **tax rate & amount split** (CGST+SGST for intra-state, IGST for inter-state), **place of supply** (recipient state — drives IGST vs CGST/SGST), recipient name/GSTIN (B2B), and total.

**Action items**
- [ ] 🔴 Add GST fields to the invoice: COPG Global **GSTIN**, registered address, **SAC code**, **place of supply**, **CGST/SGST/IGST** breakup, taxable value
- [ ] 🔴 Capture **place of supply** (customer state) at checkout to compute IGST vs CGST/SGST
- [ ] 🟡 Collect optional **customer GSTIN** for B2B invoices (input-tax-credit eligibility)
- [ ] 🟡 Keep invoices in the retention set (do not delete on account deletion — tax record-keeping; reflect this on `/data-deletion`)
- [ ] 🔵 Confirm GST registration status of COPG Global and the correct SaaS SAC/rate with a CA

---

## 4. Google Play Developer Program Policies

### 4.1 User Data policy
- [ ] 🔴 Privacy policy URL live (`/privacy`) and Data Safety form accurate (LAUNCH-CHECKLIST §3.4/§3.6)
- [ ] 🔴 Prominent disclosure & consent before collecting data not obvious to the user; encrypt in transit
- [ ] 🔴 Account-deletion in-app (`DELETE /v1/account`) + public URL (`/data-deletion`) — Play's account-deletion requirement

### 4.2 Permissions & APIs
- [ ] 🔴 Request only needed permissions. Manifest currently declares only **`INTERNET`** — minimal and good. Re-audit the **merged** manifest after autolinking AdMob/RN libs; justify any added permission
- [ ] 🔴 Declare **no location** (DCard uses none)

### 4.3 Subscriptions & Play Billing — 🔴 CRITICAL RISK

**The issue.** Google Play policy requires that purchases of **in-app digital goods and services consumed within the app** use **Google Play Billing**. DCard currently uses **Razorpay** *inside the Android app* for:

| In-app purchase | Endpoint(s) | Likely classification |
|---|---|---|
| **Subscriptions** (Premium / Business plans) | `subscriptions/checkout` → `payments/verify` | Digital subscription **consumed in-app** → **likely requires Play Billing** |
| **Template unlocks** (paid templates) | `templates/{id}/unlock` (money/mixed) → `templates/verify` | Digital good unlocked in-app → **likely requires Play Billing** |
| **Reward points** purchased/redeemed for in-app value | `rewards/redeem`, mixed unlocks | In-app virtual currency/value → **likely requires Play Billing** |

Using a third-party processor (Razorpay) for these *within the Android app* **may violate the Payments policy** and is a common cause of rejection/removal.

**Possible exemptions to evaluate (with policy + counsel):**
- Purchases of **physical goods/services** consumed *outside* the app are exempt — but DCard's purchases are digital and consumed in-app, so this likely does **not** apply.
- Google's limited "alternative billing" / user-choice billing programs (region/eligibility dependent) — investigate availability for India.
- A pure **web/SaaS** purchase made on the website (not surfaced or funneled from the Android app) can use any processor — but you **cannot** link/steer users from the Android app to an external purchase flow for in-app digital goods (anti-steering rules; subject to ongoing regulatory change).

**Recommended path:**
- [ ] 🔴 **Do not ship the Android app until this is resolved.** Get a written determination on whether subscriptions/template unlocks/rewards are "digital goods consumed in-app."
- [ ] 🔴 If they are: integrate **Google Play Billing** for those purchases **in the Android app** (keep Razorpay for the **web** app). This likely means a billing abstraction in `mobile/src/services/checkout.ts` that routes Android purchases to Play Billing.
- [ ] 🟡 Reconcile entitlements server-side regardless of processor (subscription state, unlocked templates, wallet) so web (Razorpay) and Android (Play Billing) stay consistent.
- [ ] 🟡 Document the decision and the rationale; revisit if Play policy / Indian regulatory guidance changes.

### 4.4 Other Play policies
- [ ] 🔴 **Ads**: declare "contains ads"; comply with the Ads policy; **replace the AdMob sample app ID** in `mobile/app.json` with real IDs (LAUNCH-CHECKLIST §3.6); add a consent/CMP flow
- [ ] 🔴 **User-generated content** (cards, portfolios, leads): provide a moderation/report mechanism and remove-on-report (see §5)
- [ ] 🟡 **Families policy**: ensure the app is not child-directed (it's 18+); no ads to minors
- [ ] 🟡 **Deceptive behavior / metadata**: store listing must match actual functionality

---

## 5. Other compliance

### Terms of Service
- [ ] 🔴 Publish **ToS** at `/terms` (web — not yet built): eligibility (18+), acceptable use, subscription/refund terms, IP, liability, governing law (India), grievance contact.

### Age gating (18+)
- [ ] 🔴 Gate signup to **18+** (declaration at registration + ToS) so DPDP children's-data rules and Play families policy don't apply; IARC questionnaire answered accordingly.

### Content moderation (user-generated cards/portfolios)
- [ ] 🔴 Provide **report/flag** + takedown for public cards (`/c/[slug]`) and portfolio images; admin remove action (Filament). Required for UGC under Play + IT Rules.
- [ ] 🟡 Basic abuse detection (block obvious illegal/spam content); honor lawful takedown requests.

### Anti-spam for lead capture
- [ ] 🔴 The public lead endpoint (`POST public/cards/{slug}/leads`) is the most abusable surface — enforce **rate limiting** (`throttle:public`), and add **CAPTCHA/honeypot** + consent text on the public form.
- [ ] 🟡 Ensure card owners use captured leads lawfully (consent text + ToS clause; DCard passes the obligation to the owner).

---

## 6. What's required before launch — priority order

### 🔴 Must-have (blocks launch)

| # | Item | Where |
|---|---|---|
| 1 | **Resolve Play Billing vs Razorpay** for in-app subscriptions/templates/rewards; integrate Play Billing in the Android app if required | §4.3 |
| 2 | Publish **Privacy Policy** (`/privacy`), **ToS** (`/terms`), **Data deletion** (`/data-deletion`) pages — none exist yet | §1, §5, web |
| 3 | Appoint & publish **Grievance Officer** (info@copg.in); implement **data export** (DPDP access) | §1 |
| 4 | Production secrets: `APP_DEBUG=false`, `APP_ENV=production`, fresh `APP_KEY`/`JWT_SECRET`, `CORS_ALLOWED_ORIGINS` not `*`, changed admin creds | LAUNCH §1 |
| 5 | **Release-signed AAB** + Play App Signing; bump **targetSdkVersion 34 → 35** | LAUNCH §3.1/§3.2 |
| 6 | Replace **AdMob sample app ID** with real IDs; add ads consent (CMP) | §4.4 |
| 7 | **GST-compliant invoices** (GSTIN, SAC, place of supply, tax split) | §3 |
| 8 | **18+ age gate** + **UGC moderation/report** + **lead-form anti-spam (CAPTCHA + rate limit + consent)** | §5 |
| 9 | Razorpay **live keys + webhook secret**; **no card data stored/logged**; decide auto-renew/e-mandate | §2, LAUNCH §2 |
| 10 | Accurate **Data Safety** form + IARC rating + account-deletion URL submitted | LAUNCH §3.4/§3.5/§3.6 |

### 🟡 Should-have (soon after launch)

| # | Item | Where |
|---|---|---|
| 1 | Retention policy + breach-response runbook | §1 |
| 2 | Customer GSTIN capture for B2B invoices | §3 |
| 3 | Server-side entitlement reconciliation across web/Android processors | §4.3 |
| 4 | Cookie/analytics consent banner on web | LAUNCH §5 |
| 5 | Error monitoring, log management, automated DB-backup restore test | LAUNCH §2 |

> The single biggest launch risk is **§4.3 (Play Billing)** — it can block the Android release outright and may require code changes in `mobile/src/services/checkout.ts`. Decide it first.

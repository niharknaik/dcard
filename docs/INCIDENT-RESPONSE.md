# DCard — Incident & Breach-Response Runbook

Product: **DCard**, a product of **COPG Global**. Market: **India**. Surfaces: Laravel 12 API + Filament admin (`backend/`), Next.js web (`web/`), React Native Android app (`mobile/`). Payments: **Razorpay**.

This runbook defines **how DCard detects, responds to, and reports security and personal-data incidents**, including the **DPDP-Act breach-notification duties** tracked in [`COMPLIANCE.md`](./COMPLIANCE.md) §1.

> **Not legal advice.** This is operational guidance for the DCard team. Statutory breach-notification timelines and the exact obligations to the **Data Protection Board of India** and affected data principals must be confirmed against the **current DPDP rules** with legal counsel. Items marked **"confirm current statutory timeline"** are placeholders pending confirmation.

- **Owner:** Grievance Officer / DPO — **info@copg.in**
- **Last reviewed:** 2026-06-15
- **Review cadence:** at least **annually** and after every Sev-1/Sev-2 incident (post-incident review).
- **Companion docs:** [`COMPLIANCE.md`](./COMPLIANCE.md) · [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) · [`RETENTION-POLICY.md`](./RETENTION-POLICY.md)

---

## 1. Purpose & scope

This runbook applies to any **security incident** or **personal-data breach** affecting DCard, including:

- Unauthorized access to the database, R2 storage, admin panel, or servers.
- Leak/exposure of personal data (account data, leads, analytics).
- Account takeover, credential compromise, or leaked secrets (`APP_KEY`, `JWT_SECRET`, Razorpay keys, R2 keys).
- Malicious code, supply-chain compromise, or vulnerability exploitation.
- Availability incidents (outage, ransomware, data loss/corruption).
- Payment-flow incidents involving Razorpay.

A **personal-data breach** (DPDP) = any unauthorized processing, or accidental disclosure, acquisition, sharing, use, alteration, destruction, or loss of access to personal data that compromises its confidentiality, integrity, or availability.

---

## 2. Severity classification

| Severity | Definition | Examples | Target first response |
|---|---|---|---|
| **Sev-1 (Critical)** | Confirmed personal-data breach, active exploitation, or full outage | DB exfiltration, leaked production secrets in use, admin takeover, ransomware | **Immediate** (within minutes); page on-call + DPO |
| **Sev-2 (High)** | Likely breach or significant security weakness being exploited / high risk | Account-takeover cluster, exposed but not-yet-abused secret, partial data exposure | **Within 1 hour** |
| **Sev-3 (Medium)** | Security issue, contained, no confirmed personal-data impact | Single compromised non-admin account, vulnerability found in audit, spam/abuse spike | Same business day |
| **Sev-4 (Low)** | Minor / informational | Low-risk dependency advisory, isolated suspicious request | Next business day |

When in doubt, **classify up**. Any incident with **possible personal-data impact** is treated as at least Sev-2 until proven otherwise.

---

## 3. Roles & responsibilities

| Role | Who | Responsibilities |
|---|---|---|
| **Incident Lead** | Engineering on-call | Coordinates response, owns the timeline, makes containment calls |
| **Grievance Officer / DPO** | **info@copg.in** | Owns DPDP breach assessment & notifications (Board + data principals), point of contact for regulators and affected users |
| **Engineering** | Backend/web/mobile devs | Investigation, containment, eradication, recovery, fixes |
| **Comms / Support** | Support (**info@copg.in**) | User communications, store/regulator correspondence, status updates |
| **Payments liaison** | Eng + DPO | Coordinates with **Razorpay** on any payment-related incident |

For a Sev-1/Sev-2, **both the Incident Lead and the DPO are engaged immediately.**

---

## 4. Detection sources

- **Error/exception monitoring** — Sentry (Laravel, web, mobile) for crashes/anomalies (see [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) §2).
- **Application & access logs** — server/API logs; activity/audit logs (`activity_logs`).
- **Uptime / health-check monitoring** — API, web, admin availability alerts.
- **Razorpay dashboard & webhooks** — payment failures, disputes, suspicious transactions.
- **User / researcher reports** — emails to **info@copg.in**, support tickets, responsible-disclosure reports.
- **Third-party advisories** — `composer audit`, `npm audit`, dependency/CVE alerts.
- **Cloud/infra alerts** — R2, host, database provider notifications.

---

## 5. Response procedure (Identify → Contain → Eradicate → Recover → Review)

### 5.1 Identify
- [ ] Acknowledge the alert/report; assign an **Incident Lead**.
- [ ] Open an incident record (timestamped log of events, actions, decisions — all times absolute, e.g. 2026-06-15 14:30 IST).
- [ ] Assign a **severity** (§2). If any personal data may be involved, notify the **DPO immediately**.
- [ ] Establish scope: what systems, what data categories (cross-reference [`RETENTION-POLICY.md`](./RETENTION-POLICY.md) §2), how many data principals.

### 5.2 Contain
- [ ] Stop the bleeding: revoke/rotate compromised credentials (`APP_KEY`, `JWT_SECRET`, Razorpay keys, R2 keys, admin passwords), invalidate sessions/JWTs, block offending IPs.
- [ ] Isolate affected systems; take services to **maintenance mode** if needed (Admin → App Settings).
- [ ] **Preserve evidence** before destructive cleanup (snapshots, logs) for forensics and legal.

### 5.3 Eradicate
- [ ] Identify and remove the root cause (patch the vulnerability, remove malicious code/access, close the misconfiguration).
- [ ] Verify no persistence/backdoors remain; audit related accounts and access.

### 5.4 Recover
- [ ] Restore service from clean state/backups; verify a **tested restore** (see [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) §2 DB backups).
- [ ] Confirm integrity of data and that the fix holds; lift maintenance mode.
- [ ] Heightened monitoring for recurrence.

### 5.5 Review
- [ ] Hold a **post-incident review** (§9) within ~5 business days; capture root cause, timeline, and action items.

---

## 6. DPDP breach-notification duties

On a confirmed (or reasonably suspected) **personal-data breach**, the **DPO drives notification**:

1. **Notify the Data Protection Board of India** — file the prescribed breach notification **per the DPDP rules (confirm current statutory timeline and form)**.
2. **Notify affected data principals** — inform each affected user **per the DPDP rules (confirm current statutory timeline)**, in clear language, including:
   - the **nature and extent** of the breach,
   - the **likely consequences**,
   - the **measures taken / being taken** to mitigate, and
   - **what the user can do** to protect themselves (e.g. change password) and **how to contact** the Grievance Officer (**info@copg.in**).
3. **Document** the assessment, decision, and notifications in the incident record (the Board may require evidence of the process).

> Treat notification timelines as **time-critical**. Begin the DPDP assessment **in parallel** with containment, not after recovery. Confirm exact deadlines and recipients with counsel against the current rules.

---

## 7. Payment / Razorpay incident handling

- **DCard stores no card data / PAN** — payment instruments are handled entirely by Razorpay (PCI-DSS scope sits with Razorpay; see [`COMPLIANCE.md`](./COMPLIANCE.md) §2). A DCard breach therefore should **not** expose card numbers.
- DCard persists only **transaction/order/invoice references** — assess these as personal/financial data if exposed.
- For any payment-related incident (suspicious transactions, webhook abuse, disputed charges, suspected gateway compromise):
  - [ ] **Coordinate with Razorpay** via the dashboard/support; report per their incident process.
  - [ ] Rotate `RAZORPAY_KEY` / `RAZORPAY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` if compromise is suspected.
  - [ ] Verify webhook signature integrity; ensure no full payment payloads were logged (scrub if found).
  - [ ] If users' financial-record data was exposed, fold it into the DPDP notification (§6).

---

## 8. Communication templates

### 8.1 Internal incident alert (to Incident Lead + DPO)
```
[DCARD INCIDENT] Sev-<N> — <short title>
Detected: <YYYY-MM-DD HH:MM IST> via <source>
Summary: <what we know>
Suspected scope / data categories: <...>
Systems affected: <api/web/admin/r2/payments>
Incident Lead: <name>   DPO engaged: <yes/no>
Immediate actions taken: <...>
Next update: <time>
```

### 8.2 User breach notice (data principals)
```
Subject: Important security notice about your DCard account

Dear <user>,

We are writing to inform you of a security incident that may have affected
your DCard account. On <date> we discovered <plain-language description>.

What was involved: <data categories>.
What this means for you: <likely consequences>.
What we have done: <containment / fixes>.
What you should do: <e.g. change your password; watch for phishing>.

We have notified the relevant authorities as required. If you have any
questions or concerns, contact our Grievance Officer at info@copg.in.

— The DCard Team (a product of COPG Global)
```

### 8.3 Regulator notification (Data Protection Board of India)
Filed by the DPO using the prescribed form/channel per current DPDP rules, covering: nature/extent of the breach, data categories and number of principals affected, likely consequences, remediation taken, and DCard's contact (Grievance Officer, info@copg.in). **Confirm form and deadline with counsel.**

---

## 9. Post-incident review

For every Sev-1/Sev-2 (and recommended for Sev-3):

- [ ] **Timeline**: detection → containment → recovery (absolute timestamps).
- [ ] **Root cause** analysis (technical and process).
- [ ] **Impact**: systems, data categories, number of data principals, notifications sent.
- [ ] **What went well / what didn't.**
- [ ] **Action items** with owners and due dates (preventive fixes, monitoring gaps, runbook updates).
- [ ] Update this runbook, [`COMPLIANCE.md`](./COMPLIANCE.md), and [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) as needed.

---

## 10. Contacts

| Contact | Address |
|---|---|
| Grievance Officer / DPO | **info@copg.in** |
| Support | **info@copg.in** |
| Razorpay | via Razorpay dashboard / merchant support |
| Data Protection Board of India | per current DPDP rules (confirm channel) |

---

*Last reviewed 2026-06-15 · Owner: Grievance Officer / DPO (info@copg.in) · Next review by 2027-06-15.*

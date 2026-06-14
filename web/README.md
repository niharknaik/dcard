# DCard Web

Marketing website for DCard, built with **Next.js (App Router) + Tailwind CSS**. The
design tokens mirror the mobile app (`mobile/src/theme`) — flat indigo (`#6366F1`),
emerald accent, slate neutrals, Poppins/Open Sans — so web and app feel like one product.

## Develop

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

## Build & test

```bash
npm run build
npm start
npm test          # Jest (jsdom) — lib/ logic: vCard builder, API client
```

## Structure

```
web/
├── app/
│   ├── layout.tsx          # fonts, metadata
│   ├── page.tsx            # landing page composition
│   ├── globals.css         # Tailwind layers + base
│   └── c/[slug]/           # public card viewer (SSR)
│       ├── page.tsx        # fetch + render + OG metadata
│       └── not-found.tsx
├── components/
│   ├── card/               # PublicCardView, SaveContactButton, CopyLinkButton
│   └── ...                 # Navbar, Hero, Features, Pricing, FAQ, Footer, icons
├── lib/
│   ├── site.ts             # landing copy
│   └── card.ts             # public card types + fetch (memoised)
└── tailwind.config.ts      # design tokens (ported from the app)
```

Icons are inline SVGs (`components/icons.tsx`) — no emoji, no icon-font dependency.

## Public card viewer

`/c/{slug}` is server-rendered from `GET ${API_URL}/public/cards/{slug}`:

- Set `API_URL` (see `.env.example`) to your backend. Defaults to `http://localhost:8000/api/v1`.
- Renders avatar/header, quick actions (call / WhatsApp / email / website), **Save contact**
  (vCard download), **Copy link**, about, contact details, social links, services, portfolio.
- Per-request **Open Graph + Twitter** tags for rich link previews; `force-dynamic` so each
  visit records a view (the fetch is memoised so it hits the backend once per request).

## Dashboard (`/login` + `/dashboard`)

Client-rendered, JWT-authenticated section that uses the same API as the app:

- `/login` — email/password → `POST /auth/login`, stores the JWT in `localStorage`.
- `/dashboard` — overview: greeting, card count + analytics totals (`/auth/me`,
  `/analytics/summary`, `/cards`).
- `/dashboard/cards` — list cards with view counts, **New card**, **Edit**, and "View".
- `/dashboard/cards/new` + `/dashboard/cards/[id]/edit` — create/edit/delete cards
  (`POST /cards`, `PUT /cards/{id}`, `DELETE /cards/{id}`).
- `/dashboard/leads` — list leads with mark-as-read (`PATCH /leads/{id}/read`).
- `/dashboard/profile` — edit name/phone/email (`PUT /profile`), **upload avatar**
  (multipart via `_method=PUT`), and change password (`PUT /password`).
- Card edit page includes editors for **social links** (`/cards/{id}/social-links`),
  **services** (`/cards/{id}/services`), and **portfolio** (multipart upload to
  `/cards/{id}/portfolio`; Premium/Business only).
- `/dashboard/plans` — plans with the current one highlighted (`/plans` + `/subscription`);
  **upgrade via Razorpay web checkout** (`/subscriptions/checkout` → Razorpay → `/payments/verify`).

The public card page (`/c/[slug]`) also renders a **QR code** (generated server-side with
`qrcode`) plus a download link.

Auth: `lib/auth.ts` (token in localStorage), `lib/api-client.ts` (attaches the JWT,
unwraps `{data}`, redirects to `/login` on 401). The dashboard layout guards access.
Set `NEXT_PUBLIC_API_URL` (browser) — see `.env.example`.

> The backend must allow CORS from the web origin (configure `config/cors.php`).

## Next steps (not yet built)

- Inline edit (vs. add/remove) for social links / services / portfolio items.
- End-to-end run against a live backend (see root docs/RESUME-STATE.md).

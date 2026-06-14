# React Native App — Folder & Navigation Structure

Target structure for the `mobile/` app (scaffolded in Phase 2+). React Native (latest),
React Navigation, Zustand, Axios, React Native Paper, RN QR Code, RN Share.

```
mobile/
├── App.tsx
├── app.json
├── babel.config.js
├── tsconfig.json
├── package.json
└── src/
    ├── api/
    │   ├── client.ts            # Axios instance (baseURL, interceptors)
    │   ├── auth.api.ts
    │   ├── cards.api.ts
    │   ├── leads.api.ts
    │   ├── analytics.api.ts
    │   ├── notifications.api.ts
    │   └── subscriptions.api.ts
    ├── store/                   # Zustand stores
    │   ├── auth.store.ts        # token, user, login/logout
    │   ├── card.store.ts
    │   └── notification.store.ts
    ├── navigation/
    │   ├── RootNavigator.tsx    # switches Auth vs App stacks on token
    │   ├── AuthStack.tsx        # Login, Register, Forgot/Reset
    │   ├── AppTabs.tsx          # bottom tabs: Home, Cards, Leads, Notifications, Profile
    │   └── linking.ts           # deep links (card/{slug}, notification payloads)
    ├── screens/
    │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword
    │   ├── dashboard/           # Home/Dashboard (stats + quick actions)
    │   ├── cards/               # CardList, CardEditor, CardPreview, QrShare
    │   ├── analytics/           # AnalyticsScreen (charts)
    │   ├── leads/               # LeadList, LeadDetail
    │   ├── notifications/       # NotificationCenter
    │   ├── subscription/        # Plans, Checkout, PaymentHistory
    │   └── profile/             # Profile, ChangePassword, Settings
    ├── components/              # Reusable UI
    │   ├── ui/                  # Button, Input, Card, Avatar, EmptyState, Badge
    │   ├── charts/              # LineChart, BarChart wrappers
    │   ├── QRCodeView.tsx
    │   └── NotificationItem.tsx
    ├── hooks/                   # useAuth, useDebounce, usePagination
    ├── theme/                   # colors, spacing, typography (RN Paper theme)
    ├── utils/                   # validators, formatters, storage (secure token)
    └── types/                   # shared TS types mirroring API resources
```

## Navigation flow

```
RootNavigator
 ├── (no token) → AuthStack → Login / Register / Forgot / Reset
 └── (token)    → AppTabs
                  ├── Home (dashboard)
                  ├── Cards (list → editor → preview → QR/share)
                  ├── Leads (list → detail, search, export)
                  ├── Notifications (center, mark read, delete)
                  └── Profile (edit, change password, subscription, logout)
```

## Notification strategy (no push)

- In-app notification center polls `GET /notifications` + `GET /notifications/unread-count`
  on app focus and via a short interval while foregrounded (Zustand store + interval hook).
- Email notifications are sent server-side via Laravel Mail queues.
- A badge on the Notifications tab reflects `unread-count`.

## State management

- `auth.store`: persists JWT securely (Keychain/Keystore via `react-native-keychain`),
  exposes `login`, `logout`, `refresh`; Axios interceptor injects the bearer token and
  triggers refresh on 401.
- Server data fetched per-screen via the `api/` layer; Zustand caches cross-screen state.

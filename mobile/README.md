# DCard Mobile (React Native)

React Native + TypeScript client for the DCard API. Uses React Navigation, Zustand,
Axios (with JWT auto-refresh), React Native Paper, RN QR Code, and RN Share.
Notifications use the in-app center (polling) — no push services.

## Setup

```bash
cd mobile
npm install
cp .env.example .env          # set API_BASE_URL (Android emulator: http://10.0.2.2:8000/api/v1)
npx pod-install ios           # iOS only
npm run android               # or: npm run ios
```

`react-native-vector-icons` and `react-native-config` require the standard native
linking steps — see each package's docs (fonts in `Info.plist` / `android` gradle).

## Structure

```
src/
├── api/            Axios client + per-domain API modules (auth, cards, leads, analytics, notifications, subscriptions)
├── store/          Zustand stores (auth, notifications)
├── navigation/     Root / Auth / AppTabs / Cards / Profile navigators
├── screens/        auth, dashboard, cards, leads, notifications, profile
├── components/     Reusable UI (ScreenContainer, EmptyState, CardListItem, NotificationItem, ...)
├── theme/          Paper theme, colors, spacing
├── utils/          secure token storage (Keychain), formatters
└── types/          Shared TS types mirroring API resources
```

## Auth flow

`RootNavigator` calls `auth.store.bootstrap()` on launch: if a token exists in secure
storage and `/auth/me` succeeds → app tabs; otherwise → auth stack. The Axios interceptor
attaches the bearer token and transparently refreshes once on `401`, logging out on failure.

## Notifications

`AppTabs` polls `/notifications/unread-count` every 30s while foregrounded and badges the
Notifications tab. The notification center lists, marks read, and deletes via the store.

## Payments

`PlansScreen` calls `/subscriptions/checkout` to create a Razorpay order. Wire the
`react-native-razorpay` Checkout SDK with the returned `order` + `razorpay_key`, then
confirm via `/payments/verify` (see `docs/MOBILE-BUILD.md`).

# React Native — Build & Play Store Release Guide

The mobile app (structure in `docs/MOBILE-STRUCTURE.md`) is React Native using React
Navigation, Zustand, Axios, React Native Paper, RN QR Code, RN Share, and
`react-native-razorpay` for native checkout. It talks to the Laravel API at `/api/v1`
and uses the in-app notification center (polling) — no push.

## 1. Prerequisites

- Node.js 20+, JDK 17, Android Studio (SDK + emulator)
- React Native CLI environment (`npx react-native doctor`)

## 2. Configure the API base URL

`src/api/client.ts` reads the base URL from an env file (e.g. `react-native-config`):

```
API_BASE_URL=https://api.dcard.app/api/v1
```

The Axios instance attaches the JWT from secure storage and refreshes on `401`.

## 3. Run in development

```bash
cd mobile
npm install
npx react-native run-android      # emulator or device
```

## 4. Razorpay native checkout linking

The subscription flow opens the native Razorpay sheet via `react-native-razorpay`
(`src/services/checkout.ts`). It is an auto-linked native module, so it needs a rebuild
(not just a Metro reload) after `npm install`, plus the platform setup below.

### Android

1. Rebuild so autolinking picks up the module: `npx react-native run-android`.
2. Add the Razorpay ProGuard/R8 rules to `android/app/proguard-rules.pro` so the SDK
   survives minification in release builds:

   ```proguard
   -keepclassmembers class * {
       @android.webkit.JavascriptInterface <methods>;
   }
   -keepattributes JavascriptInterface
   -keepattributes *Annotation*
   -dontwarn com.razorpay.**
   -keep class com.razorpay.** { *; }
   -optimizations !method/inlining/*
   -keepclasses,members class * { public *; }
   ```

3. `minSdkVersion` must be ≥ 19 (already satisfied by the RN template).

### iOS

1. Install the pod (CocoaPods autolinking handles the rest):

   ```bash
   cd mobile/ios && pod install
   ```

2. The Razorpay SDK requires `platform :ios, '12.0'` (or higher) in the `Podfile`.
3. If you support UPI intent / app-switch payments, register Razorpay's queried URL
   schemes under `LSApplicationQueriesSchemes` in `Info.plist`.

> The Razorpay **key** comes from the server in the `/subscriptions/checkout` response —
> it is not bundled in the app. Signature verification happens server-side via
> `/payments/verify`, which is what actually activates the subscription.

## 5. App signing (one-time)

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore dcard-release.keystore \
  -alias dcard -keyalg RSA -keysize 2048 -validity 10000
```

Place the keystore in `mobile/android/app/` and add to `android/gradle.properties`
(keep secrets out of VCS — use CI secrets in pipelines):

```
DCARD_UPLOAD_STORE_FILE=dcard-release.keystore
DCARD_UPLOAD_KEY_ALIAS=dcard
DCARD_UPLOAD_STORE_PASSWORD=********
DCARD_UPLOAD_KEY_PASSWORD=********
```

Wire the signing config in `android/app/build.gradle` under `signingConfigs.release`.

## 6. Build release artifacts

```bash
cd mobile/android
# App Bundle (required for Play Store)
./gradlew bundleRelease       # -> app/build/outputs/bundle/release/app-release.aab
# APK (for sideload/testing)
./gradlew assembleRelease     # -> app/build/outputs/apk/release/app-release.apk
```

Bump `versionCode` (integer, +1 each release) and `versionName` in `android/app/build.gradle`.

## 7. Play Store release

1. Create the app in the Google Play Console.
2. Complete: store listing, content rating, data safety (declare email + analytics
   collection), privacy policy URL (served via `/api/v1/content/pages/privacy`).
3. Upload the `.aab` to an Internal testing track first; promote to Production after QA.
4. Roll out (staged rollout recommended).

## 8. iOS (optional)

```bash
cd mobile/ios && pod install
# Open ios/DCard.xcworkspace in Xcode → set team & bundle id → Archive → upload to App Store Connect
```

## 9. Release checklist

- [ ] `API_BASE_URL` points to production
- [ ] Version code/name bumped
- [ ] Release keystore configured & backed up securely
- [ ] ProGuard/R8 rules verified (incl. Razorpay keep-rules; no broken release build)
- [ ] Razorpay checkout tested end-to-end on a device (sheet opens, `/payments/verify` succeeds)
- [ ] Deep links for `card/{slug}` + notification payloads tested
- [ ] Crash-free smoke test on a physical device

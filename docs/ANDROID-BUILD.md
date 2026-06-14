# Android build — how the APK was produced

A standalone debug APK was built locally. This documents the toolchain, the project
fixes required, and how to rebuild / test on a device.

## Output
- **APK:** `C:\Users\nihar\Desktop\DCard.apk` (~183 MB, debug-signed, JS bundled → runs
  without Metro).
- Build output path: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`.

## Toolchain (installed under C:\Android, no Android Studio IDE)
- **JDK 17** (Temurin) — `C:\Android\jdk17\jdk-17.0.19+10` (RN 0.76 needs 17, not the
  system JDK 21).
- **Android SDK** (cmdline-tools) — `C:\Android\sdk`: platform-tools, platforms;android-35,
  build-tools;35.0.0, **ndk;26.1.10909125** (Gradle auto-installed it), cmake.
- Enabled the **zip** PHP… (n/a here) — note: separate from backend.

## Project fixes that were required (all real issues)
1. **Generated `mobile/android/`** from the RN 0.76.5 template (the project had no native
   folders). Package `com.dcard`, component name `DCard`.
2. **Missing CLI deps** — added `@react-native-community/cli`,
   `cli-platform-android`, `cli-platform-ios` (15.0.1) to `package.json`; without them
   `react-native config` returns nothing and autolinking fails.
3. **Namespace injection** (`android/build.gradle`) — AGP 8 requires a namespace;
   `react-native-razorpay` only sets `package` in its manifest. Injected via
   `plugins.withId("com.android.library")`.
4. **AdMob app id** — `react-native-google-mobile-ads` crashes on launch without it; set in
   `app.json` under `react-native-google-mobile-ads.android_app_id` (Google sample id).
5. **Version pins** (the `^` ranges had pulled libs built for newer RN):
   - `react-native-gesture-handler` → **2.21.2** (2.32 overrides a `getPointerEvents()` API
     only in RN 0.77+).
   - `react-native-svg` → **15.8.0** (15.15 uses `yoga::StyleSizeLength`, an RN 0.78 API).
6. **Windows path length** — RN new-arch C++ codegen creates very deep `.cxx` paths that
   exceed CMake's 250-char object-path limit. Built through a short **junction**:
   `mklink /J C:\m <repo>\mobile`, running Gradle from `C:\m\android`.
7. **JS root under the junction** — Metro canonicalises sources to their real path, so the
   `@/` alias broke when bundling via `C:\m`. Set `root = file("<real mobile path>")` in the
   `react { }` block (native still uses the short junction path).
8. **Standalone JS** — `debuggableVariants = []` in the `react { }` block bundles the JS into
   the debug APK so it runs without a Metro server.
9. **API base URL** — applied `react-native-config/android/dotenv.gradle` and created
   `mobile/.env` with `API_BASE_URL` so a physical phone hits the PC's LAN IP.

## Rebuild command
```powershell
$env:JAVA_HOME = "C:\Android\jdk17\jdk-17.0.19+10"
$env:ANDROID_HOME = "C:\Android\sdk"
cd C:\m\android      # the junction — important for the path-length fix
.\gradlew.bat :app:assembleDebug
```
(`C:\m` junction: `cmd /c mklink /J C:\m "C:\Users\nihar\Documents\apps\dcard\mobile"`)

## Test on a physical phone
1. Phone + PC on the **same Wi-Fi**.
2. Backend reachable on the LAN:
   `cd backend; php artisan serve --host=0.0.0.0 --port=8000`
3. **Allow the port through Windows Firewall** (admin PowerShell — one time):
   `New-NetFirewallRule -DisplayName "DCard API 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow`
4. Copy `DCard.apk` to the phone (USB / Drive / email), enable "install unknown apps", tap to install.
5. Open the app → register, or log in with `superadmin@dcard.app` / `Super@12345`.
   - If the LAN IP changes, edit `mobile/.env` `API_BASE_URL` and rebuild.

## Notes
- This is a **debug** APK (debug-signed). For Play Store you need a release build with a real
  keystore (`signingConfigs` + `assembleRelease`).
- `.env`, the `root`/`debuggableVariants` lines, and the version pins are local build choices;
  keep the version pins (they're genuine RN 0.76 compatibility fixes).

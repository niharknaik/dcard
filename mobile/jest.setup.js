/* eslint-env jest */
// Extra Jest matchers (toBeOnTheScreen, toHaveTextContent, ...). Built into
// react-native-testing-library v12.4+, so no separate jest-native dep needed.
import '@testing-library/react-native/extend-expect';

// --- Native module mocks -----------------------------------------------------

// react-native-config exposes build-time env vars; default to empty so the
// API client falls back to its hard-coded base URL.
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

// Secure token storage (Keychain / Keystore) has no JS implementation in Jest.
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Razorpay native checkout sheet.
jest.mock('react-native-razorpay', () => ({
  __esModule: true,
  default: {open: jest.fn()},
}));

// Vector icons (used transitively by react-native-paper). Paper's
// MaterialCommunityIcon does `require('react-native-vector-icons/...').default`
// and warns "no icon libraries installed" when that's falsy — so the mock MUST
// expose a `default`. This covers components (e.g. Searchbar) that hit the icon
// font directly; the PaperProvider `settings.icon` stub in the test render
// helper additionally renders icon names as queryable text for the rest.
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'Icon',
}));

// Async storage community mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Google Mobile Ads native SDK — provide inert components so AdMobBanner renders
// in tests without the native module.
jest.mock(
  'react-native-google-mobile-ads',
  () => ({
    __esModule: true,
    default: () => ({initialize: () => Promise.resolve()}),
    BannerAd: () => null,
    BannerAdSize: {ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER'},
    TestIds: {ADAPTIVE_BANNER: 'test-banner'},
  }),
  {virtual: true},
);

// Ads store — default to "disabled" everywhere so AdSlot renders nothing and no
// network call fires in screen tests. AdSlot's own tests override this mock.
jest.mock('@/store/ads.store', () => ({
  useAdsStore: (selector) =>
    selector({
      payload: null,
      loaded: true,
      loading: false,
      ensureLoaded: () => Promise.resolve(),
      reload: () => Promise.resolve(),
      adFor: () => null,
    }),
}));

// --- Timers ------------------------------------------------------------------
// react-native-paper components (TextInput label float, Button activity
// indicator, Surface elevation, Snackbar auto-hide) schedule Animated/setTimeout
// work that can fire AFTER a test finishes ("access ... after it has been torn
// down") or, if executed on teardown, bleed an animation frame into the next
// test (flaky waitFor). Fake timers + DISCARDING (not running) anything pending
// on teardown avoids both. RNTL still advances fake timers inside waitFor/findBy
// during a test, so async assertions keep working.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

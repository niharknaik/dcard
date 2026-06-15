/**
 * Cookie / analytics consent helpers (DPDP-aligned).
 *
 * Consent is stored client-side under {@link CONSENT_KEY}. The absence of a
 * stored value means the user has not yet made a choice — in that state we treat
 * analytics/ads as NOT consented (consent is opt-in, never pre-ticked).
 */
export const CONSENT_KEY = 'dcard_cookie_consent';

export type ConsentValue = 'accepted' | 'rejected';

/** Read the stored consent choice, or `null` if none has been made / SSR. */
export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

/** Persist the user's consent choice. Safe to call on the client only. */
export function setConsent(value: ConsentValue): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage may be unavailable (private mode); fail silently */
  }
}

/**
 * Whether the user has actively consented to analytics/ads cookies.
 * Future analytics / AdMob bootstrapping should gate on this.
 */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}

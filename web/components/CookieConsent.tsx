'use client';

import * as React from 'react';
import {getConsent, setConsent, type ConsentValue} from '@/lib/consent';

/**
 * DPDP-aligned cookie/analytics consent banner.
 *
 * - Shows only on first visit (no stored choice); hides once a choice is made.
 * - Consent is opt-in: nothing is pre-selected and analytics/ads default to off.
 * - Choice persists in localStorage so it survives reloads and routes.
 * - Renders only after mount to avoid SSR/hydration mismatch.
 */
export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (getConsent() === null) {
      setVisible(true);
    }
  }, []);

  const choose = React.useCallback((value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-text"
      className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md">
      <div className="rounded-xl border border-line bg-white/95 p-5 shadow-card backdrop-blur">
        <p id="cookie-consent-text" className="text-sm leading-relaxed text-ink-soft">
          We use only essential cookies by default. With your consent we also use analytics and
          advertising cookies to improve DCard. You can withdraw consent anytime. Read our{' '}
          <a href="/privacy" className="cursor-pointer font-semibold text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-brand-gradient bg-[length:160%_160%] px-4 py-2.5 text-sm font-semibold text-white shadow-glow outline-none transition-all duration-300 hover:shadow-glow-lg hover:bg-[position:100%_50%] focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2">
            Accept all
          </button>
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 shadow-soft outline-none transition-all duration-300 hover:border-primary-300 hover:bg-primary-100 hover:shadow-card focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2">
            Necessary only
          </button>
        </div>
      </div>
    </div>
  );
}

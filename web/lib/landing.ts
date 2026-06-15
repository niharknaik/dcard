import * as React from 'react';
import {site, stats, features, steps, plans, faqs, trustedBy, testimonials, type Plan} from '@/lib/site';

// React's request-memoising `cache` is patched in by Next at runtime; fall back
// to a passthrough when it's unavailable (e.g. under Jest / plain React).
const memo: <T extends (...args: never[]) => unknown>(fn: T) => T =
  typeof (React as {cache?: unknown}).cache === 'function'
    ? (React as unknown as {cache: <T extends (...args: never[]) => unknown>(fn: T) => T}).cache
    : fn => fn;

export interface HeroContent {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  primary_cta: string;
  secondary_cta: string;
  rating: string;
  rating_caption: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface StepItem {
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CtaContent {
  badge: string;
  title: string;
  description: string;
}

export interface LandingContent {
  hero: HeroContent;
  stats: StatItem[];
  features: FeatureItem[];
  steps: StepItem[];
  testimonials: TestimonialItem[];
  trusted_by: string[];
  pricing: Plan[];
  faqs: FaqItem[];
  cta: CtaContent;
}

export const defaultLandingContent: LandingContent = {
  hero: {
    badge: 'No paper · No friction · No third-party trackers',
    title: 'Your digital visiting card,',
    highlight: 'everywhere',
    description: site.description,
    primary_cta: 'Get the app',
    secondary_cta: 'See how it works',
    rating: '4.8',
    rating_caption: 'Loved by 10,000+ professionals',
  },
  stats,
  features,
  steps,
  testimonials,
  trusted_by: trustedBy,
  pricing: plans,
  faqs,
  cta: {
    badge: 'Free forever — no credit card needed',
    title: 'Ready to go digital?',
    description:
      'Create your card in minutes and start sharing today. Join 10,000+ professionals who never run out of business cards again.',
  },
};

const API_BASE = process.env.API_URL ?? 'http://localhost:8000/api/v1';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge `source` over `target`. Arrays and primitives from `source`
 * replace those in `target`; nested plain objects are merged recursively. Keys
 * missing (or undefined) in `source` keep the `target` value.
 */
function deepMerge<T>(target: T, source: unknown): T {
  if (!isPlainObject(source) || !isPlainObject(target)) {
    return (source === undefined ? target : (source as T));
  }
  const result: Record<string, unknown> = {...target};
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue === undefined) {
      continue;
    }
    const targetValue = (target as Record<string, unknown>)[key];
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }
  return result as T;
}

/**
 * Fetch admin-editable landing-page content. Memoised per request. On any
 * network error or non-ok response, returns the hardcoded defaults. Fetched
 * data is deep-merged over the defaults so any missing keys fall back.
 */
export const getLandingContent = memo(async (): Promise<LandingContent> => {
  try {
    const res = await fetch(`${API_BASE}/content/landing`, {
      headers: {Accept: 'application/json'},
      cache: 'no-store',
    });
    if (!res.ok) {
      return defaultLandingContent;
    }
    const json = await res.json();
    const data = json?.data;
    if (!data) {
      return defaultLandingContent;
    }
    return deepMerge(defaultLandingContent, data);
  } catch {
    return defaultLandingContent;
  }
});

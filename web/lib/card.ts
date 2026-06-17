import * as React from 'react';

// React's request-memoising `cache` is patched in by Next at runtime; fall back
// to a passthrough when it's unavailable (e.g. under Jest / plain React).
const memo: <T extends (...args: never[]) => unknown>(fn: T) => T =
  typeof (React as {cache?: unknown}).cache === 'function'
    ? (React as unknown as {cache: <T extends (...args: never[]) => unknown>(fn: T) => T}).cache
    : fn => fn;

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  label: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string | null;
  type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  size: number | null;
  sort_order: number;
}

export interface PublicCard {
  slug: string;
  full_name: string;
  profile_photo: string | null;
  banner: string | null;
  designation: string | null;
  company: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  about: string | null;
  public_url: string | null;
  theme?: {primary?: string | null} | null;
  social_links?: SocialLink[];
  services?: Service[];
  portfolio?: PortfolioItem[];
}

const API_BASE = process.env.API_URL ?? 'http://localhost:8000/api/v1';

/**
 * Fetch a published public card by slug. Memoised per request so calling it in
 * both generateMetadata() and the page only hits the backend once (the endpoint
 * records a view analytics event on each GET).
 */
export const getPublicCard = memo(async (slug: string): Promise<PublicCard | null> => {
  try {
    const res = await fetch(`${API_BASE}/public/cards/${encodeURIComponent(slug)}`, {
      headers: {Accept: 'application/json'},
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    return (json?.data as PublicCard) ?? null;
  } catch {
    return null;
  }
});

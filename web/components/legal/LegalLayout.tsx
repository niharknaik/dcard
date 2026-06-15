import * as React from 'react';
import {site} from '@/lib/site';

type LegalLayoutProps = {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
};

/**
 * Shared layout for legal/compliance pages (Privacy, Terms, Data Deletion).
 * Server component — uses the "Aurora Glass" design tokens.
 */
export function LegalLayout({title, lastUpdated, children}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-xl">
        <div className="container-px flex h-16 items-center">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-glow">
              D
            </span>
            <span className="font-display text-lg font-bold text-ink">{site.name}</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="container-px py-12 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm font-medium text-ink-muted">Last updated: {lastUpdated}</p>

          <div className="mt-10 space-y-10 text-base leading-relaxed text-ink-soft">{children}</div>

          <p className="mt-16 border-t border-line pt-6 text-sm text-ink-muted">
            {site.name} — a COPG Global product
          </p>
        </article>
      </main>
    </div>
  );
}

/** Reusable section heading for legal pages. */
export function LegalSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

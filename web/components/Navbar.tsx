'use client';

import * as React from 'react';
import {site} from '@/lib/site';
import {ButtonLink} from './ui/Button';

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <nav
        aria-label="Primary"
        className={`container-px flex h-14 items-center justify-between rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'border-white/60 bg-white/75 shadow-soft backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}>
        <a href="#top" className="flex items-center gap-2.5" aria-label={site.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mark.svg" alt="" width={36} height={36} className="h-9 w-9 shadow-glow rounded-xl" />
          <span className="font-display text-lg font-bold text-ink">{site.name}</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {site.nav.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="relative cursor-pointer text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
            Log in
          </ButtonLink>
          <ButtonLink href="#download" className="px-4 py-2.5">
            Get the app
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}

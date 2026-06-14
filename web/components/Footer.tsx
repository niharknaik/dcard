import * as React from 'react';
import {site} from '@/lib/site';

const columns = [
  {title: 'Product', links: ['Features', 'Pricing', 'How it works', 'FAQ']},
  {title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact']},
  {title: 'Legal', links: ['Privacy', 'Terms', 'Security']},
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-px grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-base font-bold text-white shadow-glow">
              D
            </span>
            <span className="font-display text-lg font-bold text-ink">{site.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{site.tagline}</p>
          <p className="mt-3 text-xs font-medium text-ink-muted">
            A{' '}
            <a
              href="https://copgglobal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer font-semibold text-primary hover:underline">
              COPG Global
            </a>{' '}
            product
          </p>
        </div>

        {columns.map(col => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(link => (
                <li key={link}>
                  <a
                    href="#"
                    className="cursor-pointer text-sm text-ink-soft transition-colors duration-200 hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-6 text-sm text-ink-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name} by COPG Global. All rights reserved.
          </p>
          <p>Made for professionals who move fast.</p>
        </div>
      </div>
    </footer>
  );
}

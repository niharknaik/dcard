'use client';

import * as React from 'react';
import {Icon} from '../icons';

function initials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * A realistic, live preview of how a card looks with a given template —
 * driven by the template's primary colour, font and layout. Used in the
 * marketplace preview so users see the result before applying.
 */
export function CardPreviewMock({
  color,
  font,
  layout,
  name,
  role,
  company,
}: {
  color: string;
  font?: string | null;
  layout?: string;
  name: string;
  role: string;
  company: string;
}) {
  const split = layout === 'split';
  const headerStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 55%, #0B1020) 100%)`,
  };
  const fontStyle: React.CSSProperties | undefined = font
    ? {fontFamily: `"${font}", Inter, system-ui, sans-serif`}
    : undefined;
  const handle = (company || 'studio').toLowerCase().replace(/[^a-z0-9]/g, '');
  const first = name.split(' ')[0].toLowerCase();

  return (
    <div
      className="mx-auto w-[300px] overflow-hidden rounded-[1.6rem] border border-white/60 bg-white shadow-card"
      style={fontStyle}>
      {/* Header */}
      <div className={`relative px-5 pb-10 pt-7 text-white ${split ? 'text-left' : 'text-center'}`} style={headerStyle}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_70%_0%,rgba(255,255,255,0.22),transparent)]"
          aria-hidden
        />
        <div className={`relative flex ${split ? 'items-center gap-3' : 'flex-col items-center'}`}>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/40 bg-white/20 text-lg font-bold backdrop-blur">
            {initials(name)}
          </div>
          <div className={split ? '' : 'mt-2.5'}>
            <p className="text-base font-bold leading-tight">{name}</p>
            <p className="text-xs text-white/85">
              {role}
              {company ? ` · ${company}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="-mt-5 grid grid-cols-4 gap-2 px-4">
        {['call', 'whatsapp', 'mail', 'globe'].map(n => (
          <div
            key={n}
            className="grid place-items-center rounded-xl bg-white py-2 shadow-soft ring-1 ring-line/60"
            style={{color}}>
            <Icon name={n} width={16} height={16} />
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="space-y-2 px-4 py-4">
        {[
          {label: 'Email', value: `${first}@${handle}.co`},
          {label: 'Website', value: `${handle}.co/${first}`},
        ].map(r => (
          <div key={r.label} className="rounded-lg bg-surface-alt px-3 py-1.5">
            <p className="text-[9px] uppercase tracking-wide text-ink-muted">{r.label}</p>
            <p className="text-xs font-medium text-ink">{r.value}</p>
          </div>
        ))}

        {layout === 'gallery' ? (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{backgroundColor: `color-mix(in srgb, ${color} ${25 + i * 20}%, white)`}}
              />
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-white" style={{backgroundColor: color}}>
          <span className="text-xs font-semibold">Save contact</span>
          <Icon name="arrowRight" width={14} height={14} />
        </div>
      </div>
    </div>
  );
}

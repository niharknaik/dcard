import * as React from 'react';
import {Icon} from './icons';

/** A phone-framed preview of a digital card — mirrors the app's card UI. */
export function CardMockup() {
  return (
    <div className="relative mx-auto w-[290px]">
      {/* Glow halo */}
      <div
        className="absolute -inset-8 -z-10 rounded-[3.5rem] bg-brand-gradient opacity-30 blur-3xl"
        aria-hidden
      />

      <div className="animate-float rounded-[2.6rem] border-[10px] border-ink/90 bg-canvas shadow-float">
        <div className="overflow-hidden rounded-[1.9rem]">
          {/* Header band */}
          <div className="relative bg-brand-gradient bg-[length:150%_150%] px-5 pb-11 pt-9 text-center text-white">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_70%_10%,rgba(255,255,255,0.25),transparent)]"
              aria-hidden
            />
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/40 bg-white/20 text-2xl font-bold backdrop-blur">
              AR
            </div>
            <p className="relative mt-3 font-display text-lg font-bold">Aarav Rao</p>
            <p className="relative text-sm text-white/85">Product Designer · Lumen</p>
          </div>

          {/* Quick actions */}
          <div className="-mt-6 grid grid-cols-4 gap-2 px-4">
            {['phone', 'inbox', 'qr', 'portfolio'].map(name => (
              <div
                key={name}
                className="grid place-items-center rounded-xl bg-white py-2.5 text-primary shadow-soft ring-1 ring-line/60">
                <Icon name={name} width={18} height={18} />
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="space-y-2.5 px-4 py-5">
            {[
              {label: 'Email', value: 'aarav@lumen.co'},
              {label: 'Website', value: 'lumen.co/aarav'},
              {label: 'Location', value: 'Bengaluru, IN'},
            ].map(row => (
              <div key={row.label} className="rounded-xl bg-surface-alt px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-ink-muted">{row.label}</p>
                <p className="text-sm font-medium text-ink">{row.value}</p>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-xl bg-accent-50 px-3 py-2.5 ring-1 ring-accent-500/20">
              <span className="text-sm font-semibold text-accent-600">Save contact</span>
              <Icon name="arrowRight" width={16} height={16} className="text-accent-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification chip */}
      <div className="absolute -right-4 top-16 hidden animate-float rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-card backdrop-blur [animation-delay:1.2s] sm:flex sm:items-center sm:gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-50 text-accent-600">
          <Icon name="inbox" width={16} height={16} />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink">New lead captured</p>
          <p className="text-[11px] text-ink-muted">Just now</p>
        </div>
      </div>

      {/* Floating views chip */}
      <div className="absolute -left-6 bottom-20 hidden animate-float rounded-2xl border border-white/70 bg-white/90 px-3.5 py-2.5 shadow-card backdrop-blur [animation-delay:2.4s] sm:flex sm:items-center sm:gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-primary">
          <Icon name="chart" width={16} height={16} />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink">1,248 views</p>
          <p className="text-[11px] text-ink-muted">+18% this week</p>
        </div>
      </div>
    </div>
  );
}

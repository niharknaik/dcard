import * as React from 'react';

export function StatCard({label, value}: {label: string; value: number | string}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
        aria-hidden
      />
      <p className="relative font-display text-3xl font-extrabold text-gradient">{value}</p>
      <p className="relative mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="grid place-items-center py-16">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-100 border-t-violet-500" />
    </div>
  );
}

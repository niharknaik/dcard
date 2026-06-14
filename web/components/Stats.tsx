import * as React from 'react';
import {stats} from '@/lib/site';

export function Stats() {
  return (
    <section className="container-px py-12">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-line bg-white/70 p-6 shadow-soft backdrop-blur sm:grid-cols-4 sm:gap-6 sm:p-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`text-center ${i > 0 ? 'sm:border-l sm:border-line' : ''}`}>
            <p className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">{s.value}</p>
            <p className="mt-1.5 text-sm text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

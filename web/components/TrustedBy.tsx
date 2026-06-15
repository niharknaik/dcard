import * as React from 'react';

/** Infinite logo marquee — a credibility strip under the hero. */
export function TrustedBy({logos}: {logos: string[]}) {
  const row = [...logos, ...logos];
  return (
    <section aria-label="Trusted by" className="border-y border-line/70 bg-white/50 py-8">
      <p className="container-px text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        Trusted by teams at fast-moving companies
      </p>
      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused]">
          {row.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="select-none whitespace-nowrap font-display text-xl font-bold text-ink/60 transition-colors duration-300 hover:text-ink">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

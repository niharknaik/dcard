import * as React from 'react';
import type {HeroContent} from '@/lib/landing';
import {ButtonLink} from './ui/Button';
import {Icon} from './icons';
import {CardMockup} from './CardMockup';

export function Hero({hero}: {hero: HeroContent}) {
  return (
    <section id="top" className="relative overflow-hidden pt-10">
      {/* Aurora mesh + grid backdrop */}
      <div className="aurora left-[-10%] top-[-8%] h-[34rem] w-[34rem] bg-violet-400/40" aria-hidden />
      <div
        className="aurora right-[-12%] top-[2%] h-[30rem] w-[30rem] bg-fuchsia-400/30 [animation-delay:2s]"
        aria-hidden
      />
      <div className="aurora left-[30%] top-[20%] h-[26rem] w-[26rem] bg-primary-300/40 [animation-delay:4s]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />

      <div className="container-px grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink-soft shadow-soft backdrop-blur">
            <Icon name="bolt" width={14} height={14} className="text-violet-500" />
            {hero.badge}
          </span>

          <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {hero.title} <span className="text-gradient">{hero.highlight}</span>.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">{hero.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="#download" className="px-6 py-3.5 text-base">
              {hero.primary_cta}
              <Icon
                name="arrowRight"
                width={18}
                height={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </ButtonLink>
            <ButtonLink href="#how" variant="secondary" className="px-6 py-3.5 text-base">
              <Icon name="playCircle" width={18} height={18} className="text-primary" />
              {hero.secondary_cta}
            </ButtonLink>
          </div>

          {/* Social proof row */}
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center">
              {['from-violet-500 to-primary-600', 'from-primary-500 to-fuchsia-500', 'from-fuchsia-500 to-violet-600', 'from-accent-500 to-primary-500'].map(
                (g, i) => (
                  <span
                    key={i}
                    className={`-ml-2 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${g} text-[11px] font-bold text-white first:ml-0`}>
                    {['JS', 'MK', 'AR', 'Tn'][i]}
                  </span>
                ),
              )}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({length: 5}).map((_, i) => (
                  <Icon key={i} name="star" width={15} height={15} />
                ))}
                <span className="ml-1.5 text-sm font-semibold text-ink">{hero.rating}</span>
              </div>
              <p className="text-sm text-ink-muted">{hero.rating_caption}</p>
            </div>
          </div>
        </div>

        <div className="relative animate-fade-up delay-150 lg:justify-self-end">
          <CardMockup />
        </div>
      </div>
    </section>
  );
}

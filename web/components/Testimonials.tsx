import * as React from 'react';
import {testimonials} from '@/lib/site';
import {Icon} from './icons';
import {SectionHeading} from './ui/SectionHeading';

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden">
      <div className="aurora right-[-10%] top-[10%] h-[24rem] w-[24rem] bg-fuchsia-400/20" aria-hidden />
      <div className="container-px py-20 sm:py-28">
        <SectionHeading
          eyebrow="Loved by professionals"
          title="The card that does the networking for you"
          subtitle="Real results from people who ditched paper for good."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`flex flex-col rounded-2xl border border-line bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${
                i === 1 ? 'md:-translate-y-3 md:shadow-card' : ''
              }`}>
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({length: 5}).map((_, s) => (
                  <Icon key={s} name="star" width={16} height={16} />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

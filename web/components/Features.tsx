import * as React from 'react';
import type {FeatureItem} from '@/lib/landing';
import {Icon} from './icons';
import {SectionHeading} from './ui/SectionHeading';

export function Features({features}: {features: FeatureItem[]}) {
  return (
    <section id="features" className="relative overflow-hidden">
      <div className="aurora left-[-8%] top-[20%] h-[24rem] w-[24rem] bg-violet-400/20" aria-hidden />
      <div className="container-px py-20 sm:py-28">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to make a great first impression"
          subtitle="A complete toolkit to present yourself, share instantly and turn every scan into an opportunity."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <article
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-card">
              {/* hover glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gradient opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                aria-hidden
              />
              <div className="relative mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary transition-all duration-300 group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow">
                <Icon name={f.icon} />
              </div>
              <h3 className="relative text-lg font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

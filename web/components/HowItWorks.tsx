import * as React from 'react';
import {steps} from '@/lib/site';
import {SectionHeading} from './ui/SectionHeading';

export function HowItWorks() {
  return (
    <section id="how" className="relative bg-white">
      <div className="container-px py-20 sm:py-28">
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in minutes"
          subtitle="No design skills, no printing, no waiting. Three steps and you're sharing."
        />

        <ol className="relative mt-16 grid gap-10 md:grid-cols-3">
          {/* connecting gradient line */}
          <span
            className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-violet-400/30 via-primary-400/60 to-fuchsia-400/30 md:block"
            aria-hidden
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="relative z-10 mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient font-display text-lg font-bold text-white shadow-glow ring-4 ring-white">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

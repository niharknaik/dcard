import * as React from 'react';
import {plans} from '@/lib/site';
import {Icon} from './icons';
import {ButtonLink} from './ui/Button';
import {SectionHeading} from './ui/SectionHeading';

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden">
      <div className="aurora right-[-8%] bottom-[10%] h-[26rem] w-[26rem] bg-primary-300/30" aria-hidden />
      <div className="container-px py-20 sm:py-28">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans that grow with you"
          subtitle="Start free, upgrade when you're ready. Cancel anytime."
        />

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {plans.map(plan => {
            const card = (
              <div
                className={`relative flex h-full flex-col rounded-[1.4rem] bg-white p-7 ${
                  plan.highlight ? 'shadow-glow' : 'border border-line shadow-soft'
                }`}>
                {plan.highlight ? (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow">
                    <Icon name="sparkle" width={13} height={13} />
                    Most popular
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>

                <div className="mt-5 flex items-end gap-1">
                  <span
                    className={`font-display text-4xl font-extrabold ${
                      plan.highlight ? 'text-gradient' : 'text-ink'
                    }`}>
                    {plan.price}
                  </span>
                  <span className="mb-1.5 text-sm text-ink-muted">{plan.period}</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600">
                        <Icon name="check" width={13} height={13} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href="#download"
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  className="mt-7 w-full">
                  {plan.cta}
                </ButtonLink>
              </div>
            );

            return plan.highlight ? (
              <div
                key={plan.name}
                className="gradient-ring rounded-[1.55rem] p-[1.5px] lg:-translate-y-3">
                {card}
              </div>
            ) : (
              <div key={plan.name} className="h-full">
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

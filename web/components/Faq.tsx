import * as React from 'react';
import {faqs} from '@/lib/site';
import {SectionHeading} from './ui/SectionHeading';

export function Faq() {
  return (
    <section id="faq" className="bg-white">
      <div className="container-px py-20 sm:py-28">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map(item => (
            <details
              key={item.q}
              className="group rounded-2xl border border-line bg-white px-6 py-5 shadow-soft transition-colors duration-200 open:border-primary-200 [&_summary]:list-none">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-ink">
                {item.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-muted transition-all duration-300 group-open:rotate-45 group-open:border-transparent group-open:bg-brand-gradient group-open:text-white">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

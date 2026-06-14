import * as React from 'react';
import {Icon} from '../icons';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({eyebrow, title, subtitle, center = true}: Props) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow ? (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600 ${
            center ? 'mx-auto' : ''
          }`}>
          <Icon name="sparkle" width={13} height={13} />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-lg leading-relaxed text-ink-soft">{subtitle}</p> : null}
    </div>
  );
}

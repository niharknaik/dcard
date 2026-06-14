import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-gradient bg-[length:160%_160%] text-white shadow-glow hover:shadow-glow-lg hover:bg-[position:100%_50%] focus-visible:ring-primary-400',
  secondary:
    'bg-primary-50 text-primary-700 border border-primary-200 shadow-soft hover:bg-primary-100 hover:border-primary-300 hover:shadow-card focus-visible:ring-primary-400',
  ghost: 'text-ink-soft hover:text-ink hover:bg-surface-alt focus-visible:ring-primary-400',
};

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
}

export function ButtonLink({variant = 'primary', className = '', children, ...props}: Props) {
  return (
    <a
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}>
      {children}
    </a>
  );
}

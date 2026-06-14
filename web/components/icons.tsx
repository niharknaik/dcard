import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icons: Record<string, (p: IconProps) => React.ReactElement> = {
  card: p => (
    <svg {...base} {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8" cy="11" r="2" />
      <path d="M14 10h5M14 13.5h5M5 16h9" />
    </svg>
  ),
  qr: p => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3M21 14v0M17 21h4v-4M14 21h0" />
    </svg>
  ),
  inbox: p => (
    <svg {...base} {...p}>
      <path d="M3 13l2.5-7.5A2 2 0 017.4 4h9.2a2 2 0 011.9 1.5L21 13v5a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M3 13h5a2 2 0 002 2h4a2 2 0 002-2h5" />
    </svg>
  ),
  chart: p => (
    <svg {...base} {...p}>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-3M12 16v-7M16 16v-5" />
    </svg>
  ),
  portfolio: p => (
    <svg {...base} {...p}>
      <rect x="3" y="6" width="18" height="14" rx="2.5" />
      <path d="M9 6V5a2 2 0 012-2h2a2 2 0 012 2v1M3 12h18" />
    </svg>
  ),
  bell: p => (
    <svg {...base} {...p}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M10.5 21a1.5 1.5 0 003 0" />
    </svg>
  ),
  check: p => (
    <svg {...base} {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
  arrowRight: p => (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  bolt: p => (
    <svg {...base} {...p}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  phone: p => (
    <svg {...base} {...p}>
      <path d="M6.5 2.5a2 2 0 012-2h7a2 2 0 012 2v19a2 2 0 01-2 2h-7a2 2 0 01-2-2z" />
      <path d="M10.5 19.5h3" />
    </svg>
  ),
  call: p => (
    <svg {...base} {...p}>
      <path d="M3 5.5C3 4 4 3 5.5 3H7l2 4.5-2 1.5a12 12 0 006 6l1.5-2L19 16v1.5C19 19 18 20 16.5 20 9 20 3 14 3 5.5z" />
    </svg>
  ),
  mail: p => (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  ),
  globe: p => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  ),
  whatsapp: p => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...p}>
      <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.4.5-.3.3c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.7.3.1.5.1.7-.1l.8-1c.2-.3.4-.2.7-.1l2 .9c.3.1.5.2.5.3.1.2.1.6-.1 1.3z" />
    </svg>
  ),
  mapPin: p => (
    <svg {...base} {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  link: p => (
    <svg {...base} {...p}>
      <path d="M9 15l6-6" />
      <path d="M10.5 6.5l1-1a4 4 0 015.5 5.5l-1 1M13.5 17.5l-1 1A4 4 0 017 13l1-1" />
    </svg>
  ),
  download: p => (
    <svg {...base} {...p}>
      <path d="M12 3v12M7 11l5 5 5-5M5 21h14" />
    </svg>
  ),
  copy: p => (
    <svg {...base} {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 012-2h8" />
    </svg>
  ),
  apple: p => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...p}>
      <path d="M16.365 1.43c0 1.14-.42 2.21-1.12 3.02-.84.98-2.2 1.74-3.34 1.65-.14-1.1.43-2.27 1.1-3.01.78-.86 2.16-1.5 3.36-1.66zM20.5 17.2c-.6 1.38-.88 1.99-1.65 3.2-1.08 1.69-2.6 3.79-4.48 3.81-1.67.02-2.1-1.09-4.36-1.08-2.26.01-2.73 1.1-4.4 1.08-1.88-.02-3.32-1.92-4.4-3.6C-1.3 16.96-1.6 11.1.92 8.06c1.1-1.34 2.83-2.18 4.46-2.18 1.66 0 2.7 1.09 4.07 1.09 1.33 0 2.14-1.09 4.07-1.09 1.45 0 2.99.79 4.08 2.15-3.59 1.97-3 7.1.9 9.17z" />
    </svg>
  ),
  play: p => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...p}>
      <path d="M3.6 2.1l13.5 7.8c1.2.7 1.2 2.5 0 3.2L3.6 20.9c-1.1.6-2.6-.1-2.6-1.6V3.7c0-1.4 1.5-2.2 2.6-1.6z" />
    </svg>
  ),
  sparkle: p => (
    <svg {...base} {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    </svg>
  ),
  star: p => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} {...p}>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z" />
    </svg>
  ),
  shield: p => (
    <svg {...base} {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  users: p => (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 4a3 3 0 010 6M21 20c0-2.8-1.5-4.4-4-4.9" />
    </svg>
  ),
  playCircle: p => (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export function Icon({name, ...props}: {name: string} & IconProps) {
  const Cmp = Icons[name] ?? Icons.card;
  return <Cmp aria-hidden {...props} />;
}

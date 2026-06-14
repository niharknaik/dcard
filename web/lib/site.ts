export const site = {
  name: 'DCard',
  tagline: 'Your digital visiting card, everywhere.',
  description:
    'Create a beautiful digital visiting card, share it with a tap or QR code, capture leads and track every view — all from your phone.',
  nav: [
    {label: 'Features', href: '#features'},
    {label: 'How it works', href: '#how'},
    {label: 'Pricing', href: '#pricing'},
    {label: 'FAQ', href: '#faq'},
  ],
};

export const stats = [
  {value: '10k+', label: 'Cards created'},
  {value: '4.8★', label: 'Average rating'},
  {value: '120+', label: 'Countries'},
  {value: '0', label: 'Paper wasted'},
];

export type Feature = {title: string; description: string; icon: string};

export const features: Feature[] = [
  {
    icon: 'card',
    title: 'Beautiful digital cards',
    description: 'Craft a polished card with your photo, role, company, contact details and brand colours.',
  },
  {
    icon: 'qr',
    title: 'Share by QR or link',
    description: 'One tap to share. Anyone can scan your QR or open your link — no app required to view.',
  },
  {
    icon: 'inbox',
    title: 'Capture leads',
    description: 'Visitors send their details straight to your inbox. Never lose a connection again.',
  },
  {
    icon: 'chart',
    title: 'Know your reach',
    description: 'Track views, unique visitors, QR scans and link clicks with built-in analytics.',
  },
  {
    icon: 'portfolio',
    title: 'Showcase your work',
    description: 'Add a portfolio and services so prospects see what you do, not just who you are.',
  },
  {
    icon: 'bell',
    title: 'Private notifications',
    description: 'In-app + email alerts for leads and milestones. No Firebase, no third-party trackers.',
  },
];

export const steps = [
  {title: 'Create your card', description: 'Add your details, photo and links in minutes.'},
  {title: 'Share it anywhere', description: 'Send your link or let people scan your QR code.'},
  {title: 'Grow your network', description: 'Capture leads and watch your analytics climb.'},
];

export type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

export const plans: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Everything you need to get started.',
    features: ['1 card', 'Basic template', 'Limited analytics'],
    cta: 'Get started',
  },
  {
    name: 'Premium',
    price: '₹299',
    period: '/month',
    description: 'For professionals who want to stand out.',
    features: ['Unlimited cards', 'Premium templates', 'Portfolio uploads', 'Full analytics', 'Lead collection'],
    cta: 'Go Premium',
    highlight: true,
  },
  {
    name: 'Business',
    price: '₹999',
    period: '/month',
    description: 'For teams that grow together.',
    features: ['Everything in Premium', 'Team management', 'Employee cards', 'Advanced analytics'],
    cta: 'Talk to us',
  },
];

export const trustedBy = ['Lumen', 'Northwind', 'Acme Co', 'Vertex', 'Polaris', 'Meridian', 'Cobalt', 'Skyline'];

export type Testimonial = {quote: string; name: string; role: string; initials: string};

export const testimonials: Testimonial[] = [
  {
    quote:
      'I shared my DCard at a conference and had 14 leads in my inbox before I got home. It paid for itself the first week.',
    name: 'Aarav Rao',
    role: 'Product Designer, Lumen',
    initials: 'AR',
  },
  {
    quote:
      'Our whole sales team switched to DCard. The analytics tell us exactly which events are worth attending.',
    name: 'Meera Shah',
    role: 'Head of Sales, Vertex',
    initials: 'MS',
  },
  {
    quote:
      'Clean, fast, and it just works on every phone. People are genuinely impressed when I tap to share.',
    name: 'Daniel Okafor',
    role: 'Founder, Cobalt Studio',
    initials: 'DO',
  },
];

export const faqs = [
  {
    q: 'Do people need the app to view my card?',
    a: 'No. Your card opens in any browser via your link or QR code. The app is only for creating and managing your cards.',
  },
  {
    q: 'Can I create more than one card?',
    a: 'Yes — Premium and Business plans include unlimited cards, perfect for multiple roles or businesses.',
  },
  {
    q: 'How do leads work?',
    a: 'Visitors can send you their contact details from your card. Leads land in your inbox with in-app and email alerts.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. DCard uses a privacy-first notification system — no Firebase, no OneSignal, no third-party ad trackers on your card.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'Payments are handled securely through Razorpay, supporting cards, UPI, net banking and wallets.',
  },
];

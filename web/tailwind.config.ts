import type {Config} from 'tailwindcss';

/**
 * "Aurora Glass" design system — a premium, modern SaaS aesthetic.
 * Brand gradient: violet -> indigo -> fuchsia. Emerald reserved for success/save.
 * Slate neutrals on a near-white canvas, with aurora mesh + glass surfaces.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          DEFAULT: '#6366F1',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          DEFAULT: '#8B5CF6',
        },
        fuchsia: {
          400: '#E879F9',
          500: '#D946EF',
          600: '#C026D3',
          DEFAULT: '#D946EF',
        },
        accent: {
          50: '#ECFDF5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#10B981',
        },
        ink: {
          DEFAULT: '#0B1020',
          soft: '#475569',
          muted: '#64748B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F1F5F9',
        },
        canvas: '#F7F8FC',
        line: '#E2E8F0',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15, 23, 42, 0.06)',
        card: '0 12px 40px -8px rgba(15, 23, 42, 0.12)',
        float: '0 24px 60px -16px rgba(15, 23, 42, 0.22)',
        glow: '0 20px 60px -12px rgba(99, 102, 241, 0.45)',
        'glow-lg': '0 30px 90px -20px rgba(124, 58, 237, 0.55)',
        ring: '0 0 0 1px rgba(99, 102, 241, 0.12)',
      },
      maxWidth: {
        content: '1160px',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #8B5CF6 0%, #6366F1 45%, #D946EF 100%)',
        'brand-gradient-soft':
          'linear-gradient(120deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.12) 50%, rgba(217,70,239,0.12) 100%)',
        'grid-faint':
          'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          '0%': {opacity: '0', transform: 'translateY(16px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'},
        },
        float: {
          '0%, 100%': {transform: 'translateY(0)'},
          '50%': {transform: 'translateY(-14px)'},
        },
        shimmer: {
          '0%': {backgroundPosition: '-200% 0'},
          '100%': {backgroundPosition: '200% 0'},
        },
        'gradient-pan': {
          '0%, 100%': {backgroundPosition: '0% 50%'},
          '50%': {backgroundPosition: '100% 50%'},
        },
        marquee: {
          '0%': {transform: 'translateX(0)'},
          '100%': {transform: 'translateX(-50%)'},
        },
        'pulse-glow': {
          '0%, 100%': {opacity: '0.55', transform: 'scale(1)'},
          '50%': {opacity: '0.9', transform: 'scale(1.06)'},
        },
        'spin-slow': {
          to: {transform: 'rotate(360deg)'},
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'gradient-pan': 'gradient-pan 6s ease infinite',
        marquee: 'marquee 28s linear infinite',
        'pulse-glow': 'pulse-glow 7s ease-in-out infinite',
        'spin-slow': 'spin-slow 16s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

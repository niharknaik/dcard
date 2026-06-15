import type {Metadata, Viewport} from 'next';
import './globals.css';
import {CookieConsent} from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'DCard — Your digital visiting card, everywhere',
  description:
    'Create a beautiful digital visiting card, share it with a tap or QR code, capture leads and track views. No paper, no friction.',
  openGraph: {
    title: 'DCard — Your digital visiting card, everywhere',
    description:
      'Create a beautiful digital visiting card, share it with a tap or QR code, capture leads and track views.',
    type: 'website',
    siteName: 'DCard',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

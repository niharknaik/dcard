import * as React from 'react';
import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'About Us — DCard',
  description: 'About DCard, the digital visiting card platform by COPG Global.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About Us" lastUpdated="16 June 2026">
      <p>
        DCard is a digital visiting card platform built by COPG Global. We help professionals and
        businesses create a beautiful digital card, share it instantly with a tap or QR code, capture
        leads, and track engagement — all without paper.
      </p>

      <LegalSection title="What we do">
        <ul className="list-disc space-y-2 pl-6">
          <li>Create polished digital cards with your photo, role, contact details and brand colours.</li>
          <li>Share by link or QR code — no app required for the person viewing your card.</li>
          <li>Capture leads directly to your inbox and showcase your portfolio and services.</li>
          <li>Understand your reach with built-in views, scans and link-click analytics.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Our mission">
        <p>
          To make professional networking effortless, sustainable and measurable — replacing paper
          business cards with a fast, private, always-up-to-date digital identity.
        </p>
      </LegalSection>

      <LegalSection title="Privacy first">
        <p>
          We use a privacy-first approach: your data is used only to create and maintain your card,
          and never for other purposes without your permission. Read our{' '}
          <a href="/privacy" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </a>{' '}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="The company">
        <p>
          DCard is operated by COPG Global. Learn more at{' '}
          <a
            href="https://copgglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline">
            copgglobal.com
          </a>
          , or get in touch via our{' '}
          <a href="/contact" className="font-semibold text-primary hover:underline">
            Contact page
          </a>{' '}
          or at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

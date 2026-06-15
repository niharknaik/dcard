import * as React from 'react';
import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Contact Us — DCard',
  description: 'Get in touch with the DCard team at COPG Global for support, billing and privacy queries.',
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us" lastUpdated="16 June 2026">
      <p>
        DCard is a product of COPG Global. We&apos;re happy to help with support, billing, privacy or
        any other questions. The fastest way to reach us is by email.
      </p>

      <LegalSection title="Email">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            General &amp; support:{' '}
            <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
              info@copg.in
            </a>
          </li>
          <li>
            Billing &amp; refunds:{' '}
            <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
              info@copg.in
            </a>
          </li>
          <li>
            Privacy &amp; grievances (Grievance Officer):{' '}
            <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
              info@copg.in
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Company">
        <p>COPG Global</p>
        <p>[COPG Global registered address]</p>
        <p>[COPG Global contact phone]</p>
        <p>
          Website:{' '}
          <a
            href="https://copgglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline">
            copgglobal.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="Response time">
        <p>
          We aim to respond to all queries within 2–3 business days, and to privacy-related requests
          within the timelines required under the Digital Personal Data Protection Act, 2023.
        </p>
      </LegalSection>

      <LegalSection title="Related">
        <p>
          See our{' '}
          <a href="/privacy" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </a>
          ,{' '}
          <a href="/terms" className="font-semibold text-primary hover:underline">
            Terms &amp; Conditions
          </a>
          ,{' '}
          <a href="/refund" className="font-semibold text-primary hover:underline">
            Refund &amp; Cancellation Policy
          </a>{' '}
          and{' '}
          <a href="/data-deletion" className="font-semibold text-primary hover:underline">
            Data Deletion
          </a>{' '}
          pages.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

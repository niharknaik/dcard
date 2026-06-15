import * as React from 'react';
import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — DCard',
  description: 'How subscription cancellations and refunds work for DCard, a product of COPG Global.',
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" lastUpdated="16 June 2026">
      <p>
        This Refund &amp; Cancellation Policy explains how payments and cancellations are handled for
        DCard, a product of COPG Global. By making a purchase you agree to this policy. Payments are
        processed securely through Razorpay; we do not store your card details.
      </p>

      <LegalSection title="1. All payments are final — no refunds">
        <p>
          <strong>All payments made on DCard are final and non-refundable once completed.</strong>{' '}
          Because access to digital features is granted immediately, we do not offer refunds, partial
          refunds, or credit for any payment after it is successfully processed. This applies to all
          purchases, including subscription plans, premium template unlocks, and reward-point
          redemptions.
        </p>
        <p>Please review your plan and pricing carefully before completing any payment.</p>
      </LegalSection>

      <LegalSection title="2. Subscriptions & cancellation">
        <ul className="list-disc space-y-2 pl-6">
          <li>Paid plans are billed in advance for the chosen billing period (for example, monthly).</li>
          <li>You can cancel a paid subscription at any time from your account to stop future renewals.</li>
          <li>
            On cancellation, your plan stays active until the end of the current paid period; it will
            not renew after that. No refund is issued for the remaining or unused part of the period.
          </li>
          <li>We do not charge a cancellation fee.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. One-time purchases & reward points">
        <p>
          Premium template unlocks and other one-time purchases are delivered digitally and are
          non-refundable once purchased. Reward points have no cash value, cannot be exchanged for
          money, and points spent on redemptions are non-refundable.
        </p>
      </LegalSection>

      <LegalSection title="4. Incorrect or duplicate charges">
        <p>
          The no-refund policy above does not affect your legal rights. If you believe you were
          charged incorrectly — for example, a duplicate charge caused by a technical error — contact
          us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>{' '}
          with your transaction/invoice number and we will investigate and correct genuine errors.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>
          For any billing questions, contact us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>{' '}
          or via our{' '}
          <a href="/contact" className="font-semibold text-primary hover:underline">
            Contact page
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

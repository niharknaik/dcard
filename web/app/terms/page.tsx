import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service — DCard',
  description:
    'The terms and conditions governing your use of DCard, a digital visiting-card service and product of COPG Global.',
};

const LAST_UPDATED = '14 June 2026';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <LegalSection title="1. Acceptance of terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of DCard (&ldquo;DCard&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), a digital visiting-card service operated by COPG
          Global. By creating an account or using DCard, you agree to be bound by these Terms and by our Privacy
          Policy. If you do not agree, do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and capable of forming a binding contract to use DCard. By using the
          service you represent that you meet these requirements and that the information you provide is accurate.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts &amp; security">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activity
          under your account. Notify us promptly at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>{' '}
          of any unauthorised use or security breach. We are not liable for losses arising from your failure to
          protect your credentials.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to use DCard to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Violate any law, regulation or the rights of others.</li>
          <li>Upload unlawful, infringing, deceptive, harmful or offensive content.</li>
          <li>Impersonate any person or misrepresent your affiliation with any entity.</li>
          <li>Transmit malware, spam, or engage in fraud, phishing or harvesting of data.</li>
          <li>Interfere with, disrupt or attempt to gain unauthorised access to the service or its systems.</li>
        </ul>
        <p>We may suspend or remove content or accounts that violate these Terms.</p>
      </LegalSection>

      <LegalSection title="5. Subscriptions, billing &amp; Razorpay">
        <p>
          DCard offers free and paid subscription plans. Paid plans are billed in advance through our payment
          partner Razorpay, which supports cards, UPI, net banking and wallets. By subscribing, you authorise us and
          Razorpay to charge the applicable fees and any taxes for the selected plan and billing cycle. Prices and
          plan features may change; we will give reasonable notice of material changes that affect you.
        </p>
      </LegalSection>

      <LegalSection title="6. Payments, cancellation &amp; no refunds">
        <p>
          All payments are final. Once a payment is successfully completed it is{' '}
          <strong>non-refundable</strong>, as access to digital features is granted immediately. This
          applies to subscriptions, premium template unlocks and reward-point redemptions. You may
          cancel a subscription at any time to stop future renewals; you retain access until the end
          of the current billing period, with no refund for the unused portion. Genuine billing
          errors (such as duplicate charges) can be reported to{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          . See our{' '}
          <a href="/refund" className="font-semibold text-primary hover:underline">
            Refund &amp; Cancellation Policy
          </a>{' '}
          for full details.
        </p>
      </LegalSection>

      <LegalSection title="7. Reward points &amp; referrals">
        <p>
          We may offer reward points, referral bonuses or promotional credits. These have no cash value, cannot be
          exchanged for money, and are non-transferable. We may modify, suspend, expire or discontinue any reward or
          referral programme, or change its terms, at any time. Rewards obtained through fraud or abuse may be
          revoked.
        </p>
      </LegalSection>

      <LegalSection title="8. User content &amp; licence">
        <p>
          You retain ownership of the content you create or upload to DCard (&ldquo;User Content&rdquo;). You grant
          us a worldwide, non-exclusive, royalty-free licence to host, store, reproduce and display your User
          Content solely as necessary to operate and provide the service (for example, to render and share your
          card). You are responsible for ensuring you have the rights to all content you upload.
        </p>
      </LegalSection>

      <LegalSection title="9. Our intellectual property">
        <p>
          DCard, including its software, design, templates, logos and trademarks, is owned by COPG Global and
          protected by intellectual-property laws. Except for the limited right to use the service under these
          Terms, no rights are granted to you. You may not copy, modify, reverse-engineer or create derivative works
          from the service without our written permission.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          You may stop using DCard and delete your account at any time. We may suspend or terminate your access if
          you breach these Terms, if required by law, or if we discontinue the service. Upon termination, your right
          to use the service ends; sections that by their nature should survive (such as IP, disclaimers, liability
          and governing law) will continue to apply.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimers &amp; limitation of liability">
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind,
          whether express or implied, to the maximum extent permitted by law. We do not warrant that the service
          will be uninterrupted, error-free or secure. To the fullest extent permitted by law, COPG Global and its
          affiliates will not be liable for any indirect, incidental, special, consequential or punitive damages, or
          for loss of data, profits or goodwill. Our total aggregate liability for any claim relating to the service
          will not exceed the amount you paid to us in the 12 months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnity">
        <p>
          You agree to indemnify and hold harmless COPG Global, its affiliates and personnel from any claims,
          damages, liabilities and expenses (including reasonable legal fees) arising out of your User Content, your
          use of the service, or your breach of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing law &amp; jurisdiction">
        <p>
          These Terms are governed by the laws of India. Subject to applicable law, the courts at [COPG Global
          registered address jurisdiction], India, will have exclusive jurisdiction over any dispute arising out of
          or relating to these Terms or the service.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to these terms">
        <p>
          We may update these Terms from time to time. When we make material changes, we will update the &ldquo;Last
          updated&rdquo; date above and, where appropriate, notify you. Your continued use of DCard after the
          changes take effect constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="15. Contact">
        <p>
          For questions about these Terms, contact us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          . Postal address: [COPG Global registered address].
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

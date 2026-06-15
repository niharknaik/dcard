import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Account & Data Deletion — DCard',
  description:
    'How to delete your DCard account and personal data, what is deleted versus retained, and the timeline. DCard is a product of COPG Global.',
};

const LAST_UPDATED = '14 June 2026';

export default function DataDeletionPage() {
  return (
    <LegalLayout title="Account & Data Deletion" lastUpdated={LAST_UPDATED}>
      <p>
        You can delete your DCard account and associated personal data at any time. This page explains how to do so
        — both inside the app and by email — what data is removed, what we are legally required to keep, and how
        long the process takes. DCard is a product of COPG Global.
      </p>

      <LegalSection title="1. Delete your account in the app">
        <p>To delete your account directly from the DCard app:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Open the DCard app and sign in.</li>
          <li>
            Go to <span className="font-semibold text-ink">Profile</span>.
          </li>
          <li>
            Tap <span className="font-semibold text-ink">Delete account</span>.
          </li>
          <li>Confirm the deletion when prompted.</li>
        </ul>
        <p>
          Once confirmed, your account is scheduled for deletion and your public cards are taken offline
          immediately.
        </p>
      </LegalSection>

      <LegalSection title="2. Request deletion via web or email">
        <p>
          If you cannot access the app, you can request deletion by email. Send a message from the email address
          registered to your DCard account to{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>{' '}
          with the subject &ldquo;Account deletion request&rdquo;. We may ask you to verify your identity before
          processing the request to protect your account. Using the in-app option above is the fastest method.
        </p>
      </LegalSection>

      <LegalSection title="3. What data is deleted vs retained">
        <p>When your account is deleted, we delete or anonymise:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your account profile (name, email, phone and hashed password).</li>
          <li>Your digital cards and their content, including uploaded images and files.</li>
          <li>Your leads, card analytics and usage data tied to your account.</li>
        </ul>
        <p>We may retain a limited set of records where the law requires us to, including:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Transaction and invoice records (payment reference, amount, plan, date) needed for tax, accounting and
            financial-compliance purposes.
          </li>
          <li>Records we must keep to comply with legal obligations, resolve disputes or prevent fraud.</li>
        </ul>
        <p>
          Retained records are kept only for as long as legally required and are protected in line with our{' '}
          <a href="/privacy" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Timeline">
        <p>
          Deletion requests are processed within 30 days of confirmation or verification. Public cards are removed
          right away; backend data is fully deleted or anonymised within that window, except for records we are
          required to retain as described above.
        </p>
      </LegalSection>

      <LegalSection title="5. What happens to your public cards">
        <p>
          Your public cards and their links and QR codes stop working as soon as deletion is confirmed. Anyone who
          had your link or QR code will no longer be able to view your card. We cannot recover a deleted account or
          its cards, so please export anything you wish to keep beforehand.
        </p>
      </LegalSection>

      <LegalSection title="6. Need help?">
        <p>
          If you have any questions about deleting your account or data, email us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          . For data-protection grievances, you may also contact our Grievance Officer at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

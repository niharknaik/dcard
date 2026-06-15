import type {Metadata} from 'next';
import {LegalLayout, LegalSection} from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy — DCard',
  description:
    'How DCard, a product of COPG Global, collects, uses, shares and protects your personal data, and your rights under the Digital Personal Data Protection Act, 2023.',
};

const LAST_UPDATED = '14 June 2026';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <LegalSection title="1. Introduction">
        <p>
          DCard (&ldquo;DCard&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) is a digital
          visiting-card service operated by COPG Global (&ldquo;COPG Global&rdquo;). This Privacy Policy explains
          what personal data we collect, how we use and share it, how long we keep it, and the rights you have. It
          is aligned with India&rsquo;s Digital Personal Data Protection Act, 2023 (the &ldquo;DPDP Act&rdquo;) and
          with the disclosure requirements of the Google Play Data Safety section.
        </p>
        <p>
          By creating an account or using DCard, you acknowledge that you have read and understood this Privacy
          Policy. If you do not agree with it, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We collect the following categories of personal data:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold text-ink">Account information</span> — your name, email address, phone
            number and password. Passwords are stored only in hashed (irreversible) form; we never store them in
            plain text.
          </li>
          <li>
            <span className="font-semibold text-ink">Card content &amp; uploads</span> — the information you add to
            your digital card, such as your job title, company, links, services, portfolio items, profile photo and
            other images or files you upload.
          </li>
          <li>
            <span className="font-semibold text-ink">Usage &amp; analytics data</span> — card views, unique
            visitors, QR scans, link clicks, and technical details such as device type, browser, approximate
            location and IP address, used to provide analytics and protect against abuse.
          </li>
          <li>
            <span className="font-semibold text-ink">Payment information</span> — subscription payments are
            processed by our payment partner Razorpay. We do <span className="font-semibold text-ink">not</span>{' '}
            store your full card number, CVV or bank credentials. We retain only transaction metadata such as a
            payment reference, amount, plan and status for billing and accounting.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <ul className="list-disc space-y-2 pl-6">
          <li>To create, host and display your digital cards and capture leads on your behalf.</li>
          <li>To operate, maintain, secure and improve the service.</li>
          <li>To process subscriptions, payments, invoices and refunds.</li>
          <li>To provide analytics about your card&rsquo;s reach.</li>
          <li>To send you service-related and transactional communications and, where you consent, updates.</li>
          <li>To prevent fraud and abuse and to comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal basis &amp; consent (DPDP Act)">
        <p>
          Under the DPDP Act, we process your personal data primarily on the basis of your{' '}
          <span className="font-semibold text-ink">consent</span>, which you provide when you create an account and
          submit information. We may also process data for certain legitimate uses permitted by law, such as
          complying with legal obligations or providing a service you have requested. You may withdraw your consent
          at any time (see &ldquo;Your rights&rdquo;); withdrawal does not affect processing carried out before
          withdrawal and may limit your ability to use parts of the service.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing &amp; disclosure">
        <p>We do not sell your personal data. We share it only as needed with:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold text-ink">Razorpay</span> — to process payments and subscriptions
            securely.
          </li>
          <li>
            <span className="font-semibold text-ink">Hosting &amp; storage providers</span> — to host the
            application, databases and uploaded files.
          </li>
          <li>
            <span className="font-semibold text-ink">Legal &amp; safety</span> — when required by law, regulation,
            legal process, or to protect the rights, property or safety of DCard, our users or the public.
          </li>
        </ul>
        <p>
          Your public card is, by its nature, visible to anyone with whom you share its link or QR code. We require
          our processors to protect your data and to use it only for the purposes we specify.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We retain your personal data for as long as your account is active or as needed to provide the service.
          When you delete your account, we delete or anonymise your personal data within 30 days, except where we
          are required to retain certain records (such as transaction and invoice data) to meet legal, tax or
          accounting obligations. See our{' '}
          <a href="/data-deletion" className="font-semibold text-primary hover:underline">
            Data Deletion page
          </a>{' '}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="7. Security measures">
        <p>
          We use reasonable technical and organisational safeguards to protect your data, including encryption in
          transit (HTTPS), hashed password storage, access controls and monitoring. No method of transmission or
          storage is completely secure, but we work to protect your information and to notify affected users and the
          authorities of a personal data breach as required by law.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Subject to applicable law, you have the right to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access the personal data we hold about you and obtain a summary of how it is processed.</li>
          <li>Correct or update inaccurate or incomplete data.</li>
          <li>Request erasure of your personal data and delete your account.</li>
          <li>Withdraw your consent at any time.</li>
          <li>Nominate another individual to exercise your rights in the event of death or incapacity.</li>
          <li>Raise a grievance and seek redressal (see &ldquo;Grievance Officer&rdquo; below).</li>
        </ul>
        <p>
          You can exercise most of these rights from within the app (Profile settings) or by emailing us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          DCard is not intended for individuals under the age of 18. We do not knowingly collect personal data from
          minors. If you believe a minor has provided us with personal data, please contact us and we will take
          steps to delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. Cookies &amp; local storage">
        <p>
          We use cookies and browser local storage for essential functions such as keeping you signed in,
          remembering preferences and measuring basic usage. We do not use third-party advertising trackers on your
          public card. You can control cookies through your browser settings, though disabling them may affect how
          the service works.
        </p>
      </LegalSection>

      <LegalSection title="11. International transfers">
        <p>
          Your data may be processed or stored on servers located outside India. Where data is transferred
          internationally, we take steps to ensure it remains protected in accordance with this Privacy Policy and
          applicable law, including any restrictions notified by the Government of India under the DPDP Act.
        </p>
      </LegalSection>

      <LegalSection title="12. Grievance Officer">
        <p>
          In accordance with the DPDP Act, you may contact our Grievance Officer with any concern or complaint about
          how your personal data is handled:
        </p>
        <ul className="list-none space-y-1 pl-0">
          <li>
            <span className="font-semibold text-ink">Name:</span> [Grievance Officer name placeholder], COPG Global
          </li>
          <li>
            <span className="font-semibold text-ink">Email:</span>{' '}
            <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
              info@copg.in
            </a>
          </li>
          <li>
            <span className="font-semibold text-ink">Address:</span> [COPG Global registered address]
          </li>
          <li>
            <span className="font-semibold text-ink">Phone:</span> [COPG Global phone placeholder]
          </li>
        </ul>
        <p>
          We will acknowledge and respond to grievances within 30 days, as required under the DPDP Act.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. When we make material changes, we will update the
          &ldquo;Last updated&rdquo; date above and, where appropriate, notify you in the app or by email. Your
          continued use of DCard after changes take effect constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          For any questions about this Privacy Policy or your personal data, contact us at{' '}
          <a href="mailto:info@copg.in" className="font-semibold text-primary hover:underline">
            info@copg.in
          </a>
          . Postal address: [COPG Global registered address].
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

'use client';

import * as React from 'react';
import {Icon} from '../icons';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

/**
 * Public "leave your details" form rendered on a card's /c/[slug] page.
 *
 * Spam hardening (COMPLIANCE §5):
 * - `website` is a honeypot: visually hidden and skipped by real users, but
 *   filled by naive bots. The backend silently accepts honeypot hits.
 * - Submission is rate-limited server-side via the throttle:public middleware.
 * Consent: a required checkbox the visitor must tick before we share details.
 */
export function LeadForm({slug}: {slug: string}) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [website, setWebsite] = React.useState(''); // honeypot — must stay empty
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = React.useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/public/cards/${encodeURIComponent(slug)}/leads`, {
        method: 'POST',
        headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, phone, message, website, consent}),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message ?? 'Could not send your message. Please try again.');
      }
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface-alt p-6 text-center">
        <Icon name="check" width={28} height={28} className="text-accent-600" />
        <p className="text-sm font-semibold text-ink">Thanks! Your message has been sent.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" noValidate>
      <input
        type="text"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        autoComplete="name"
        className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary-200"
      />
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary-200"
      />
      <input
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Phone"
        autoComplete="tel"
        className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary-200"
      />
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Message (optional)"
        rows={3}
        className="rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-primary-200"
      />

      {/* Honeypot — hidden from humans, tempting for bots. Must stay empty. */}
      <div aria-hidden style={{position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden'}}>
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          type="text"
          name="website"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          I agree my details may be shared with the card owner. See our{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-soft transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

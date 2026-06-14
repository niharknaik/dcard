'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {ReferralDashboard} from '@/lib/types';
import {Icon} from '@/components/icons';
import {Spinner} from '@/components/dashboard/StatCard';

export default function ReferralsPage() {
  const [data, setData] = React.useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setData(await apiFetch<ReferralDashboard>('/referrals'));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load referrals.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading) return <Spinner />;
  if (!data) return <p className="text-sm text-red-500">{error || 'Failed to load.'}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Refer &amp; Earn</h1>
      <p className="mt-1 text-ink-soft">Share your code — earn points every time someone joins.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {/* Code + link hero */}
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-brand-gradient bg-[length:150%_150%] p-7 text-white shadow-glow">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_10%,rgba(255,255,255,0.2),transparent)]"
          aria-hidden
        />
        <p className="relative text-sm font-medium text-white/85">Your referral code</p>
        <p className="relative mt-1 font-display text-4xl font-extrabold tracking-[0.15em]">
          {data.referral_code}
        </p>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          <code className="max-w-full truncate rounded-xl bg-white/15 px-3.5 py-2 text-sm backdrop-blur">
            {data.referral_link}
          </code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-white/90">
            <Icon name={copied ? 'check' : 'copy'} width={15} height={15} />
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-gradient">{data.total_referrals}</p>
          <p className="mt-1 text-sm text-ink-muted">Total referrals</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-gradient">{data.total_points_earned}</p>
          <p className="mt-1 text-sm text-ink-muted">Points earned</p>
        </div>
      </div>

      {/* List */}
      <h2 className="mt-8 text-lg font-semibold">Your referrals</h2>
      {data.referrals.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No referrals yet. Share your code to start earning.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {data.referrals.map(ref => (
            <li key={ref.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600">
                  <Icon name="users" width={16} height={16} />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{ref.referred?.name ?? 'New user'}</p>
                  <p className="text-xs text-ink-muted">{new Date(ref.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-accent-600">+{ref.points_awarded}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

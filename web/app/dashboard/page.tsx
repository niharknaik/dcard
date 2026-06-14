'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {AnalyticsSummary, Card, User} from '@/lib/types';
import {Spinner, StatCard} from '@/components/dashboard/StatCard';

export default function OverviewPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [cardCount, setCardCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        const [me, analytics, cards] = await Promise.all([
          apiFetch<User>('/auth/me'),
          apiFetch<AnalyticsSummary>('/analytics/summary?period=daily'),
          apiFetch<Card[]>('/cards'),
        ]);
        setUser(me);
        setSummary(analytics);
        setCardCount(cards.length);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const t = summary?.totals;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Hi, <span className="text-gradient">{firstName}</span>
      </h1>
      <p className="mt-1 text-ink-soft">Here&apos;s how your cards are performing.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Cards" value={cardCount} />
        <StatCard label="Views" value={t?.views ?? 0} />
        <StatCard label="Unique visitors" value={t?.unique_visitors ?? 0} />
        <StatCard label="QR scans" value={t?.qr_scans ?? 0} />
        <StatCard label="Link clicks" value={t?.link_clicks ?? 0} />
        <StatCard label="Contact saves" value={t?.contact_saves ?? 0} />
      </div>
    </div>
  );
}

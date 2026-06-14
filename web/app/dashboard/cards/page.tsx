'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {Card} from '@/lib/types';
import {Icon} from '@/components/icons';
import {Spinner} from '@/components/dashboard/StatCard';

export default function CardsPage() {
  const [cards, setCards] = React.useState<Card[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setCards(await apiFetch<Card[]>('/cards'));
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your cards</h1>
          <p className="mt-1 text-ink-soft">Manage and share your digital cards.</p>
        </div>
        <a
          href="/dashboard/cards/new"
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600">
          <Icon name="bolt" width={16} height={16} />
          New card
        </a>
      </div>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {cards.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-soft">
          No cards yet — create your first one.
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {cards.map(card => {
            const subtitle = [card.designation, card.company].filter(Boolean).join(' · ') || card.slug;
            return (
              <div
                key={card.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-50 font-semibold text-primary">
                  {card.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{card.full_name}</p>
                    {!card.is_published ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                        Draft
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-ink-soft">{subtitle}</p>
                </div>
                <div className="hidden items-center gap-1.5 text-sm text-ink-muted sm:flex">
                  <Icon name="chart" width={15} height={15} />
                  {card.views_count}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/dashboard/cards/${card.id}/edit`}
                    className="cursor-pointer rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-alt">
                    Edit
                  </a>
                  <a
                    href={`/c/${card.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:border-primary-200 hover:text-primary">
                    View
                    <Icon name="arrowRight" width={15} height={15} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

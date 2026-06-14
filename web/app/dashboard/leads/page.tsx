'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {Lead} from '@/lib/types';
import {Spinner} from '@/components/dashboard/StatCard';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setLeads(await apiFetch<Lead[]>('/leads'));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = async (id: number) => {
    setLeads(prev => prev.map(l => (l.id === id ? {...l, is_read: true} : l)));
    try {
      await apiFetch(`/leads/${id}/read`, {method: 'PATCH'});
    } catch {
      // revert on failure
      setLeads(prev => prev.map(l => (l.id === id ? {...l, is_read: false} : l)));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-ink-soft">People who reached out from your cards.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      {leads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-soft">
          No leads yet. Share your card to start collecting them.
        </div>
      ) : (
        <div className="mt-8 grid gap-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              className={`rounded-2xl border bg-white p-4 shadow-soft ${
                lead.is_read ? 'border-line' : 'border-primary-200'
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-ink">{lead.name}</p>
                    {!lead.is_read ? (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        New
                      </span>
                    ) : null}
                  </div>
                  {lead.email ? <p className="truncate text-sm text-ink-soft">{lead.email}</p> : null}
                  {lead.phone ? <p className="truncate text-sm text-ink-soft">{lead.phone}</p> : null}
                  {lead.message ? <p className="mt-2 text-sm text-ink">{lead.message}</p> : null}
                  {lead.card ? (
                    <p className="mt-2 text-xs text-ink-muted">via {lead.card.full_name}</p>
                  ) : null}
                </div>
                {!lead.is_read ? (
                  <button
                    type="button"
                    onClick={() => markRead(lead.id)}
                    className="shrink-0 cursor-pointer rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-alt">
                    Mark read
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

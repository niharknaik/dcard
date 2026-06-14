'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {Service} from '@/lib/types';

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100';

export function ServicesEditor({cardId}: {cardId: number}) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setServices(await apiFetch<Service[]>(`/cards/${cardId}/services`));
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
      }
    })();
  }, [cardId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const service = await apiFetch<Service>(`/cards/${cardId}/services`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          price: price.trim() ? Number(price) : null,
          currency: 'INR',
        }),
      });
      setServices(prev => [...prev, service]);
      setName('');
      setPrice('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add service.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const prev = services;
    setServices(p => p.filter(s => s.id !== id));
    try {
      await apiFetch(`/services/${id}`, {method: 'DELETE'});
    } catch {
      setServices(prev);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold">Services</h2>

      {!loading && services.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No services yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {services.map(s => (
            <li key={s.id} className="flex items-start gap-3 rounded-xl border border-line px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-ink">{s.name}</p>
                  {s.price != null ? <p className="shrink-0 text-sm font-semibold text-primary">₹{s.price}</p> : null}
                </div>
                {s.description ? <p className="mt-0.5 text-sm text-ink-soft">{s.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => remove(s.id)}
                aria-label="Remove service"
                className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-alt hover:text-red-500">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Service name" className={inputClass} />
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price ₹"
          inputMode="numeric"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
          Add
        </button>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className={`${inputClass} sm:col-span-3`}
        />
      </form>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

'use client';

import * as React from 'react';
import {apiFetch, apiUpload} from '@/lib/api-client';
import type {PortfolioItem} from '@/lib/types';

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100';

const TYPES = ['image', 'video', 'pdf', 'brochure', 'catalog'];

export function PortfolioEditor({cardId}: {cardId: number}) {
  const [items, setItems] = React.useState<PortfolioItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [type, setType] = React.useState('image');
  const [file, setFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setItems(await apiFetch<PortfolioItem[]>(`/cards/${cardId}/portfolio`));
      } catch {
        // non-fatal
      } finally {
        setLoading(false);
      }
    })();
  }, [cardId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('type', type);
      fd.append('media', file);
      const item = await apiUpload<PortfolioItem>(`/cards/${cardId}/portfolio`, fd);
      setItems(prev => [...prev, item]);
      setTitle('');
      setFile(null);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const prev = items;
    setItems(p => p.filter(i => i.id !== id));
    try {
      await apiFetch(`/portfolio/${id}`, {method: 'DELETE'});
    } catch {
      setItems(prev);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold">Portfolio</h2>
      <p className="mt-1 text-sm text-ink-muted">Premium and Business plans only.</p>

      {!loading && items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No portfolio items yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map(item => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl border border-line">
              {item.type === 'image' && (item.thumbnail_url || item.media_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnail_url || item.media_url || ''}
                  alt={item.title}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="grid aspect-square w-full place-items-center bg-surface-alt text-xs font-semibold uppercase text-ink-muted">
                  {item.type}
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove item"
                className="absolute right-1.5 top-1.5 cursor-pointer rounded-lg bg-white/90 px-2 py-0.5 text-sm text-red-500 shadow-soft">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px]">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
        <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
          {TYPES.map(t => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-ink-soft file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary sm:col-span-2"
        />
        <button
          type="submit"
          disabled={saving || !title.trim() || !file}
          className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60 sm:col-span-2">
          {saving ? 'Uploading…' : 'Add item'}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

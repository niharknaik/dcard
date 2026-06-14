'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import type {SocialLink} from '@/lib/types';
import {Icon} from '../icons';

const PLATFORMS = ['linkedin', 'instagram', 'facebook', 'youtube', 'x', 'whatsapp', 'telegram', 'github'];

const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100';

export function SocialLinksEditor({cardId}: {cardId: number}) {
  const [links, setLinks] = React.useState<SocialLink[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [platform, setPlatform] = React.useState('linkedin');
  const [url, setUrl] = React.useState('');
  const [label, setLabel] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    (async () => {
      try {
        setLinks(await apiFetch<SocialLink[]>(`/cards/${cardId}/social-links`));
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
      const link = await apiFetch<SocialLink>(`/cards/${cardId}/social-links`, {
        method: 'POST',
        body: JSON.stringify({platform, url: url.trim(), label: label.trim() || null}),
      });
      setLinks(prev => [...prev, link]);
      setUrl('');
      setLabel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add link.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    const prev = links;
    setLinks(p => p.filter(l => l.id !== id));
    try {
      await apiFetch(`/social-links/${id}`, {method: 'DELETE'});
    } catch {
      setLinks(prev); // revert
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold">Social links</h2>

      {!loading && links.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">No links yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {links.map(link => (
            <li
              key={link.id}
              className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
              <Icon name="link" width={16} height={16} className="shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium capitalize text-ink">{link.label || link.platform}</p>
                <p className="truncate text-xs text-ink-muted">{link.url}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(link.id)}
                aria-label="Remove link"
                className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-alt hover:text-red-500">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
        <select value={platform} onChange={e => setPlatform(e.target.value)} className={inputClass}>
          {PLATFORMS.map(p => (
            <option key={p} value={p} className="capitalize">
              {p}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={saving || !url.trim()}
          className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
          Add
        </button>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className={`${inputClass} sm:col-span-3`}
        />
      </form>

      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

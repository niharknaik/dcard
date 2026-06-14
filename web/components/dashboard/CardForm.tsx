'use client';

import * as React from 'react';
import {useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api-client';
import type {CardInput} from '@/lib/types';

const EMPTY: CardInput = {
  full_name: '',
  designation: '',
  company: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  address: '',
  about: '',
  is_published: true,
};

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-100';

export function CardForm({initial, cardId}: {initial?: Partial<CardInput>; cardId?: number}) {
  const router = useRouter();
  const [values, setValues] = React.useState<CardInput>({...EMPTY, ...initial});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const set =
    (key: keyof CardInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues(v => ({...v, [key]: e.target.value}));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = JSON.stringify({...values, full_name: values.full_name.trim()});
      if (cardId) {
        await apiFetch(`/cards/${cardId}`, {method: 'PUT', body});
      } else {
        await apiFetch('/cards', {method: 'POST', body});
      }
      router.push('/dashboard/cards');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the card.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name *" className="sm:col-span-2">
          <input required value={values.full_name} onChange={set('full_name')} className={inputClass} />
        </Field>
        <Field label="Designation">
          <input value={values.designation ?? ''} onChange={set('designation')} className={inputClass} />
        </Field>
        <Field label="Company">
          <input value={values.company ?? ''} onChange={set('company')} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={values.phone ?? ''} onChange={set('phone')} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <input value={values.whatsapp ?? ''} onChange={set('whatsapp')} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={values.email ?? ''} onChange={set('email')} className={inputClass} />
        </Field>
        <Field label="Website">
          <input value={values.website ?? ''} onChange={set('website')} className={inputClass} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input value={values.address ?? ''} onChange={set('address')} className={inputClass} />
        </Field>
        <Field label="About" className="sm:col-span-2">
          <textarea rows={3} value={values.about ?? ''} onChange={set('about')} className={inputClass} />
        </Field>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={!!values.is_published}
          onChange={e => setValues(v => ({...v, is_published: e.target.checked}))}
          className="h-4 w-4 cursor-pointer rounded border-line text-primary focus:ring-primary-100"
        />
        Published (visible at your public link)
      </label>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !values.full_name.trim()}
          className="cursor-pointer rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60">
          {saving ? 'Saving…' : cardId ? 'Save changes' : 'Create card'}
        </button>
        <a
          href="/dashboard/cards"
          className="cursor-pointer rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-alt">
          Cancel
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm font-medium text-ink ${className}`}>
      {label}
      {children}
    </label>
  );
}

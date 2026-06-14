'use client';

import * as React from 'react';
import {useParams, useRouter} from 'next/navigation';
import {apiFetch} from '@/lib/api-client';
import type {Card} from '@/lib/types';
import {CardForm} from '@/components/dashboard/CardForm';
import {CardPhotoUploader} from '@/components/dashboard/CardPhotoUploader';
import {SocialLinksEditor} from '@/components/dashboard/SocialLinksEditor';
import {ServicesEditor} from '@/components/dashboard/ServicesEditor';
import {PortfolioEditor} from '@/components/dashboard/PortfolioEditor';
import {Spinner} from '@/components/dashboard/StatCard';

export default function EditCardPage() {
  const params = useParams<{id: string}>();
  const router = useRouter();
  const id = Number(params.id);

  const [card, setCard] = React.useState<Card | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setCard(await apiFetch<Card>(`/cards/${id}`));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load card.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDelete = async () => {
    if (!window.confirm('Delete this card? This cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await apiFetch(`/cards/${id}`, {method: 'DELETE'});
      router.push('/dashboard/cards');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!card) {
    return <p className="text-sm text-red-500">{error || 'Card not found.'}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit card</h1>
          <p className="mt-1 text-ink-soft">Update {card.full_name}&apos;s details.</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="cursor-pointer rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors duration-200 hover:bg-red-50 disabled:opacity-60">
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      <div className="mt-8 space-y-6">
        <CardPhotoUploader
          cardId={id}
          initial={card.profile_photo ?? null}
          fallback={card.full_name.slice(0, 1).toUpperCase()}
        />

        <CardForm
          cardId={id}
          initial={{
            full_name: card.full_name,
            designation: card.designation ?? '',
            company: card.company ?? '',
            phone: card.phone ?? '',
            whatsapp: card.whatsapp ?? '',
            email: card.email ?? '',
            website: card.website ?? '',
            address: card.address ?? '',
            about: card.about ?? '',
            is_published: card.is_published,
          }}
        />

        <SocialLinksEditor cardId={id} />
        <ServicesEditor cardId={id} />
        <PortfolioEditor cardId={id} />
      </div>
    </div>
  );
}

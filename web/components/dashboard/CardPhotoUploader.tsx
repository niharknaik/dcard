'use client';

import * as React from 'react';
import {apiUpload} from '@/lib/api-client';
import type {Card} from '@/lib/types';
import {Icon} from '../icons';

export function CardPhotoUploader({
  cardId,
  initial,
  fallback,
}: {
  cardId: number;
  initial: string | null;
  fallback: string;
}) {
  const [photo, setPhoto] = React.useState<string | null>(initial);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('_method', 'PUT'); // PHP can't parse multipart on PUT
      fd.append('profile_photo', file);
      const updated = await apiUpload<Card>(`/cards/${cardId}`, fd);
      setPhoto(updated.profile_photo ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6 shadow-soft">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="Card photo" className="h-20 w-20 rounded-full object-cover" />
      ) : (
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-50 text-xl font-bold text-primary">
          {fallback}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-ink">Card photo</p>
        <p className="text-sm text-ink-muted">JPG, PNG or WebP, up to 2 MB.</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-alt disabled:opacity-60">
          <Icon name="download" width={15} height={15} className="rotate-180" />
          {uploading ? 'Uploading…' : 'Upload photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          className="hidden"
        />
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import {Icon} from '../icons';

/**
 * Downloads the rendered card (the #dcard-card element) as a PNG image.
 * html2canvas is dynamically imported so it stays out of the initial bundle.
 */
export function DownloadCardButton({slug}: {slug: string}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const onDownload = async () => {
    const el = document.getElementById('dcard-card');
    if (!el) return;
    setBusy(true);
    setError('');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${slug}-card.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Could not generate the image. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt disabled:opacity-60">
        <Icon name="download" width={18} height={18} />
        {busy ? 'Preparing…' : 'Download card'}
      </button>
      {error ? <p className="text-center text-xs text-red-500">{error}</p> : null}
    </>
  );
}

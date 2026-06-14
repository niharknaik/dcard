'use client';

import * as React from 'react';
import {Icon} from '../icons';

export function CopyLinkButton({url}: {url: string}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy card link"
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt">
      <Icon name={copied ? 'check' : 'copy'} width={18} height={18} className={copied ? 'text-accent-600' : ''} />
      {copied ? 'Link copied' : 'Copy link'}
    </button>
  );
}

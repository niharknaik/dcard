'use client';

import * as React from 'react';
import {Icon} from '../icons';
import type {PublicCard} from '@/lib/card';
import {buildVCard} from '@/lib/vcard';

export function SaveContactButton({card}: {card: PublicCard}) {
  const onSave = () => {
    const blob = new Blob([buildVCard(card)], {type: 'text/vcard'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.slug}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={onSave}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:160%_160%] px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_50%] hover:shadow-glow-lg">
      <Icon name="download" width={18} height={18} />
      Save contact
    </button>
  );
}

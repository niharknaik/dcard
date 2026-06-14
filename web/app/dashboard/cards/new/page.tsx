'use client';

import * as React from 'react';
import {CardForm} from '@/components/dashboard/CardForm';

export default function NewCardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New card</h1>
      <p className="mt-1 text-ink-soft">Create a digital card to share.</p>
      <div className="mt-8">
        <CardForm />
      </div>
    </div>
  );
}

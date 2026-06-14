'use client';

import * as React from 'react';
import {apiFetch} from '@/lib/api-client';
import {CheckoutCancelled, unlockTemplate} from '@/lib/razorpay';
import type {Card, Template, TemplateCategory, TemplateUnlockMethod, User} from '@/lib/types';
import {Icon} from '@/components/icons';
import {Spinner} from '@/components/dashboard/StatCard';
import {CardPreviewMock} from '@/components/dashboard/CardPreviewMock';

export default function TemplatesPage() {
  const [categories, setCategories] = React.useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [cards, setCards] = React.useState<Card[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [activeCat, setActiveCat] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<number | null>(null);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [preview, setPreview] = React.useState<Template | null>(null);

  const loadTemplates = React.useCallback(async (categoryId: number | null) => {
    const q = categoryId ? `?category_id=${categoryId}` : '';
    setTemplates(await apiFetch<Template[]>(`/templates${q}`));
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const [cats, cardsList] = await Promise.all([
          apiFetch<TemplateCategory[]>('/templates/categories'),
          apiFetch<Card[]>('/cards'),
        ]);
        setCategories(cats);
        setCards(cardsList);
        await loadTemplates(null);
        try {
          setUser(await apiFetch<User>('/auth/me'));
        } catch {
          /* prefill optional */
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load templates.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadTemplates]);

  const onFilter = async (categoryId: number | null) => {
    setActiveCat(categoryId);
    setError('');
    try {
      await loadTemplates(categoryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load templates.');
    }
  };

  const onUnlock = async (template: Template, method: TemplateUnlockMethod) => {
    setBusy(template.id);
    setError('');
    setMessage('');
    try {
      await unlockTemplate(template, method, {
        name: user?.name,
        email: user?.email,
        contact: user?.phone ?? undefined,
      });
      setMessage(`Unlocked "${template.name}".`);
      await loadTemplates(activeCat);
    } catch (e) {
      if (e instanceof CheckoutCancelled) return;
      setError(e instanceof Error ? e.message : 'Could not unlock template.');
    } finally {
      setBusy(null);
    }
  };

  const onApply = async (template: Template, cardId: number, color?: string) => {
    setBusy(template.id);
    setError('');
    setMessage('');
    try {
      await apiFetch(`/templates/${template.id}/apply`, {
        method: 'POST',
        body: JSON.stringify(color ? {card_id: cardId, color} : {card_id: cardId}),
      });
      setMessage(`Applied "${template.name}" to your card.`);
      await loadTemplates(activeCat);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not apply template.');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Template Marketplace</h1>
      <p className="mt-1 text-ink-soft">Browse, unlock and apply designs to your cards.</p>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-accent-600">{message}</p> : null}

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip label="All" active={activeCat === null} onClick={() => onFilter(null)} />
        {categories.map(c => (
          <FilterChip
            key={c.id}
            label={c.name}
            active={activeCat === c.id}
            onClick={() => onFilter(c.id)}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            cards={cards}
            busy={busy === t.id}
            onUnlock={onUnlock}
            onApply={onApply}
            onPreview={setPreview}
          />
        ))}
      </div>

      {templates.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-muted">No templates in this category yet.</p>
      ) : null}

      {preview ? (
        <PreviewModal
          template={preview}
          cards={cards}
          busy={busy === preview.id}
          onClose={() => setPreview(null)}
          onUnlock={onUnlock}
          onApply={onApply}
        />
      ) : null}
    </div>
  );
}

function FilterChip({label, active, onClick}: {label: string; active: boolean; onClick: () => void}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700'
          : 'border-line bg-white text-ink-soft hover:border-primary-200 hover:text-ink'
      }`}>
      {label}
    </button>
  );
}

function priceLabel(t: Template): string {
  if (t.is_free) return 'Free';
  const parts: string[] = [];
  if (t.price > 0) parts.push(`₹${t.price}`);
  if (t.price_points > 0) parts.push(`${t.price_points} pts`);
  return parts.join('  ·  ') || 'Free';
}

function TemplateCard({
  template,
  cards,
  busy,
  onUnlock,
  onApply,
  onPreview,
}: {
  template: Template;
  cards: Card[];
  busy: boolean;
  onUnlock: (t: Template, m: TemplateUnlockMethod) => void;
  onApply: (t: Template, cardId: number, color?: string) => void;
  onPreview: (t: Template) => void;
}) {
  const [cardId, setCardId] = React.useState<number | ''>(cards[0]?.id ?? '');

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      {/* Preview */}
      <div className="group relative">
        {template.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.thumbnail} alt={template.name} className="h-36 w-full object-cover" />
        ) : (
          <div
            className="grid h-36 w-full place-items-center text-3xl font-bold text-white"
            style={{backgroundColor: template.color_scheme || '#6366F1'}}>
            {template.name.charAt(0)}
          </div>
        )}
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition-all duration-200 hover:bg-ink/40 hover:opacity-100 focus-visible:bg-ink/40 focus-visible:opacity-100">
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-card">
            <Icon name="playCircle" width={16} height={16} />
            Preview
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink">{template.name}</h3>
          {template.is_unlocked ? (
            <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-600">
              Unlocked
            </span>
          ) : null}
        </div>
        {template.category ? (
          <span className="mt-1 inline-block w-fit rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
            {template.category.name}
          </span>
        ) : null}

        <p className="mt-3 text-sm font-semibold text-ink">{priceLabel(template)}</p>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          {template.is_unlocked ? (
            <>
              {cards.length > 0 ? (
                <>
                  <select
                    value={cardId}
                    onChange={e => setCardId(Number(e.target.value))}
                    className="w-full cursor-pointer rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100">
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || cardId === ''}
                    onClick={() => cardId !== '' && onApply(template, cardId)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:160%_160%] px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_50%] disabled:opacity-60">
                    {busy ? 'Applying…' : 'Apply to card'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-ink-muted">Create a card first to apply this template.</p>
              )}
            </>
          ) : template.is_free ? (
            <UnlockButton label="Unlock — Free" busy={busy} onClick={() => onUnlock(template, 'free')} primary />
          ) : (
            <>
              {template.price_points > 0 ? (
                <UnlockButton
                  label={`Unlock with ${template.price_points} pts`}
                  busy={busy}
                  onClick={() => onUnlock(template, 'points')}
                  primary
                />
              ) : null}
              {template.price > 0 ? (
                <UnlockButton label={`Buy — ₹${template.price}`} busy={busy} onClick={() => onUnlock(template, 'money')} />
              ) : null}
              {template.price > 0 && template.price_points > 0 ? (
                <UnlockButton label="Money + Points" busy={busy} onClick={() => onUnlock(template, 'mixed')} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function UnlockButton({
  label,
  busy,
  onClick,
  primary,
}: {
  label: string;
  busy: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
        primary
          ? 'bg-brand-gradient bg-[length:160%_160%] text-white shadow-glow hover:bg-[position:100%_50%]'
          : 'border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'
      }`}>
      {busy ? 'Processing…' : label}
    </button>
  );
}

const SAMPLE_PROFILES = [
  {name: 'Aarav Mehta', role: 'Product Designer', company: 'Lumen'},
  {name: 'Sara Khan', role: 'Marketing Lead', company: 'Vertex'},
  {name: 'Daniel Osei', role: 'Founder', company: 'Cobalt'},
  {name: 'Priya Nair', role: 'Photographer', company: 'Studio Nair'},
  {name: 'Leo Martin', role: 'Consultant', company: 'Meridian'},
  {name: 'Mia Chen', role: 'Café Owner', company: 'Brew & Co'},
];

const COLOR_PRESETS = ['#6366F1', '#0EA5E9', '#10B981', '#F97316', '#E11D48', '#8B5CF6', '#0F172A', '#D946EF'];

function PreviewModal({
  template,
  cards,
  busy,
  onClose,
  onUnlock,
  onApply,
}: {
  template: Template;
  cards: Card[];
  busy: boolean;
  onClose: () => void;
  onUnlock: (t: Template, m: TemplateUnlockMethod) => void;
  onApply: (t: Template, cardId: number, color?: string) => void;
}) {
  const [cardId, setCardId] = React.useState<number | ''>(cards[0]?.id ?? '');
  const [color, setColor] = React.useState(template.color_scheme || '#6366F1');
  // Pick a sample profile once, so the preview shows a realistic example card.
  const [sample] = React.useState(() => SAMPLE_PROFILES[Math.floor(Math.random() * SAMPLE_PROFILES.length)]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const act = async (fn: () => void | Promise<void>) => {
    await fn();
    onClose();
  };

  const swatches = Array.from(new Set([template.color_scheme || '#6366F1', ...COLOR_PRESETS]));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${template.name} preview`}>
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-float md:flex-row"
        onClick={e => e.stopPropagation()}>
        {/* Live preview pane */}
        <div className="relative flex shrink-0 flex-col items-center gap-5 overflow-y-auto bg-canvas p-6 md:w-[360px]">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" aria-hidden />

          <div className="relative w-full">
            <p className="mb-3 text-center text-xs font-medium text-ink-muted">Live preview · sample card</p>
            <CardPreviewMock
              color={color}
              font={template.font_family}
              layout={template.layout}
              name={sample.name}
              role={sample.role}
              company={sample.company}
            />
          </div>

          {template.preview_images?.length ? (
            <div className="relative w-full">
              <p className="mb-2 text-center text-xs font-medium text-ink-muted">Template gallery</p>
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {template.preview_images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${template.name} preview ${i + 1}`}
                    className="h-44 w-auto shrink-0 snap-center rounded-xl border border-line object-cover shadow-soft"
                  />
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute right-3 top-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-soft hover:bg-white">
            ✕
          </button>
        </div>

        {/* Details + controls pane */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{template.name}</h2>
              {template.category ? (
                <span className="mt-1 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {template.category.name}
                </span>
              ) : null}
            </div>
            {template.is_unlocked ? (
              <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-600">
                Unlocked
              </span>
            ) : null}
          </div>

          {template.description ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{template.description}</p>
          ) : null}

          {/* Colour customisation */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Customise colour</p>
            <div className="flex flex-wrap items-center gap-2">
              {swatches.map(c => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Use ${c}`}
                  onClick={() => setColor(c)}
                  style={{backgroundColor: c}}
                  className={`h-8 w-8 cursor-pointer rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110 ${
                    color.toLowerCase() === c.toLowerCase() ? 'ring-ink' : 'ring-transparent'
                  }`}
                />
              ))}
              <label className="relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-line bg-white" title="Pick a custom colour">
                <Icon name="sparkle" width={14} height={14} className="text-ink-soft" />
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <span className="ml-1 font-mono text-xs uppercase text-ink-muted">{color}</span>
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-ink">{priceLabel(template)}</p>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2">
            {template.is_unlocked ? (
              cards.length > 0 ? (
                <>
                  <select
                    value={cardId}
                    onChange={e => setCardId(Number(e.target.value))}
                    className="w-full cursor-pointer rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100">
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        Apply to: {c.full_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || cardId === ''}
                    onClick={() => cardId !== '' && act(() => onApply(template, cardId, color))}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-gradient bg-[length:160%_160%] px-4 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:bg-[position:100%_50%] disabled:opacity-60">
                    <Icon name="check" width={16} height={16} />
                    {busy ? 'Applying…' : 'Apply this design'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-ink-muted">Create a card first to apply this template.</p>
              )
            ) : (
              <>
                {template.price_points > 0 ? (
                  <UnlockButton label={`Unlock with ${template.price_points} pts`} busy={busy} onClick={() => act(() => onUnlock(template, 'points'))} primary />
                ) : null}
                {template.price > 0 ? (
                  <UnlockButton label={`Buy — ₹${template.price}`} busy={busy} onClick={() => act(() => onUnlock(template, 'money'))} />
                ) : null}
                {template.price > 0 && template.price_points > 0 ? (
                  <UnlockButton label="Money + Points" busy={busy} onClick={() => act(() => onUnlock(template, 'mixed'))} />
                ) : null}
                <p className="mt-1 text-center text-xs text-ink-muted">Unlock to apply this design with your chosen colour.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

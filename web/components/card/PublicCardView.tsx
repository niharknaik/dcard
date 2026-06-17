import * as React from 'react';
import {Icon} from '../icons';
import {SaveContactButton} from './SaveContactButton';
import {CopyLinkButton} from './CopyLinkButton';
import {DownloadCardButton} from './DownloadCardButton';
import {LeadForm} from './LeadForm';
import type {PublicCard} from '@/lib/card';

function initials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

type Action = {icon: string; label: string; href: string};

export function PublicCardView({card, qr}: {card: PublicCard; qr?: string | null}) {
  const subtitle = [card.designation, card.company].filter(Boolean).join(' · ');
  // Template-driven accent: recolour key elements to the card's primary colour.
  const tint = card.theme?.primary || undefined;
  const tintStyle = tint ? {color: tint} : undefined;

  const actions: Action[] = [];
  if (card.phone) actions.push({icon: 'call', label: 'Call', href: `tel:${card.phone}`});
  if (card.whatsapp)
    actions.push({icon: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${card.whatsapp.replace(/[^\d]/g, '')}`});
  if (card.email) actions.push({icon: 'mail', label: 'Email', href: `mailto:${card.email}`});
  if (card.website) actions.push({icon: 'globe', label: 'Website', href: normalizeUrl(card.website)});

  const details = [
    card.phone && {icon: 'call', label: 'Phone', value: card.phone, href: `tel:${card.phone}`},
    card.email && {icon: 'mail', label: 'Email', value: card.email, href: `mailto:${card.email}`},
    card.website && {icon: 'globe', label: 'Website', value: card.website, href: normalizeUrl(card.website)},
    card.address && {icon: 'mapPin', label: 'Address', value: card.address, href: null},
  ].filter(Boolean) as {icon: string; label: string; value: string; href: string | null}[];

  const socials = (card.social_links ?? []).filter(s => s.is_active);
  const services = (card.services ?? []).filter(s => s.is_active);
  const portfolio = (card.portfolio ?? []).filter(p => p.media_url);

  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas py-8">
      {/* Aurora backdrop */}
      <div className="aurora left-1/2 top-[-6rem] h-[26rem] w-[26rem] -translate-x-1/2 bg-violet-400/30" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />

      <div className="mx-auto w-full max-w-[480px] px-4">
        <div
          id="dcard-card"
          className="animate-fade-up overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-float">
          {/* Header — uses the applied template colour when set */}
          <div
            className="relative bg-brand-gradient bg-[length:150%_150%] px-6 pb-12 pt-10 text-center text-white"
            style={
              card.theme?.primary
                ? {
                    backgroundImage: `linear-gradient(135deg, ${card.theme.primary} 0%, ${
                      card.theme.accent || `color-mix(in srgb, ${card.theme.primary} 55%, #0B1020)`
                    } 100%)`,
                  }
                : undefined
            }>
            {card.banner ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.banner} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden />
                <div className="absolute inset-0 bg-black/40" aria-hidden />
              </>
            ) : null}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_70%_0%,rgba(255,255,255,0.25),transparent)]"
              aria-hidden
            />
            {card.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.profile_photo}
                alt={card.full_name}
                className="relative mx-auto h-24 w-24 rounded-full border-4 border-white/40 object-cover shadow-lg"
              />
            ) : (
              <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/40 bg-white/20 text-2xl font-bold backdrop-blur">
                {initials(card.full_name)}
              </div>
            )}
            <h1 className="relative mt-4 font-display text-2xl font-bold">{card.full_name}</h1>
            {subtitle ? <p className="relative mt-1 text-white/85">{subtitle}</p> : null}
          </div>

          {/* Quick actions */}
          {actions.length ? (
            <div className="-mt-8 grid grid-cols-4 gap-2 px-5">
              {actions.map(a => (
                <a
                  key={a.label}
                  href={a.href}
                  target={a.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  style={tintStyle}
                  className="grid cursor-pointer place-items-center gap-1 rounded-2xl border border-line/60 bg-white py-3 text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:text-violet-600 hover:shadow-card">
                  <Icon name={a.icon} width={20} height={20} />
                  <span className="text-[11px] font-medium text-ink-soft">{a.label}</span>
                </a>
              ))}
            </div>
          ) : null}

          <div className="space-y-6 px-6 py-6">
            {/* Save / share (excluded from the downloaded image) */}
            <div className="grid gap-2" data-html2canvas-ignore="true">
              <SaveContactButton card={card} />
              <DownloadCardButton slug={card.slug} />
              {card.public_url ? <CopyLinkButton url={card.public_url} /> : null}
            </div>

            {qr ? (
              <Section title="Scan to connect">
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt={`QR code for ${card.full_name}`} className="h-44 w-44" />
                  <a
                    href={qr}
                    download={`${card.slug}-qr.png`}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    <Icon name="download" width={15} height={15} />
                    Download QR
                  </a>
                </div>
              </Section>
            ) : null}

            {card.about ? (
              <Section title="About">
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{card.about}</p>
              </Section>
            ) : null}

            {details.length ? (
              <Section title="Contact">
                <ul className="space-y-2">
                  {details.map(d => (
                    <li key={d.label}>
                      <DetailRow {...d} />
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {socials.length ? (
              <Section title="Links">
                <div className="flex flex-wrap gap-2">
                  {socials.map(s => (
                    <a
                      key={s.id}
                      href={normalizeUrl(s.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:border-primary-200 hover:text-primary">
                      <Icon name="link" width={15} height={15} />
                      {s.label || s.platform}
                    </a>
                  ))}
                </div>
              </Section>
            ) : null}

            {services.length ? (
              <Section title="Services">
                <div className="grid gap-2">
                  {services.map(s => (
                    <div key={s.id} className="rounded-xl border border-line p-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-semibold text-ink">{s.name}</p>
                        {s.price != null ? (
                          <p style={tintStyle} className="shrink-0 text-sm font-semibold text-primary">
                            {s.currency === 'INR' || !s.currency ? '₹' : s.currency + ' '}
                            {s.price}
                          </p>
                        ) : null}
                      </div>
                      {s.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {portfolio.length ? (
              <Section title="Portfolio">
                <div className="grid grid-cols-2 gap-2">
                  {portfolio.map(item => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={item.id}
                      src={item.thumbnail_url || item.media_url || ''}
                      alt={item.title}
                      className="aspect-square w-full rounded-xl border border-line object-cover"
                    />
                  ))}
                </div>
              </Section>
            ) : null}

            <Section title="Get in touch">
              <div data-html2canvas-ignore="true">
                <LeadForm slug={card.slug} />
              </div>
            </Section>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Powered by{' '}
          <a
            href="https://copgglobal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer font-semibold text-primary hover:underline">
            COPG Global
          </a>
        </p>
      </div>
    </main>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

function DetailRow({icon, label, value, href}: {icon: string; label: string; value: string; href: string | null}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl bg-surface-alt px-3.5 py-2.5">
      <Icon name={icon} width={18} height={18} className="shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="block cursor-pointer transition-opacity duration-200 hover:opacity-80">
      {inner}
    </a>
  );
}

import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getPublicCard} from '@/lib/card';
import {qrDataUrl} from '@/lib/qr';
import {PublicCardView} from '@/components/card/PublicCardView';

// Each visit records a view analytics event server-side, so never cache.
export const dynamic = 'force-dynamic';

type Params = {params: {slug: string}};

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const card = await getPublicCard(params.slug);

  if (!card) {
    return {title: 'Card not found · DCard'};
  }

  const subtitle = [card.designation, card.company].filter(Boolean).join(' · ');
  const title = `${card.full_name}${subtitle ? ' · ' + subtitle : ''}`;
  const description = card.about ?? subtitle ?? `${card.full_name}'s digital visiting card.`;
  const images = card.profile_photo ? [{url: card.profile_photo}] : undefined;

  return {
    title: `${card.full_name} · DCard`,
    description,
    openGraph: {title, description, images, type: 'profile'},
    twitter: {card: 'summary', title, description, images: card.profile_photo ? [card.profile_photo] : undefined},
  };
}

export default async function PublicCardPage({params}: Params) {
  const card = await getPublicCard(params.slug);

  if (!card) {
    notFound();
  }

  const qr = card.public_url ? await qrDataUrl(card.public_url) : null;

  return <PublicCardView card={card} qr={qr} />;
}

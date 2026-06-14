import type {PublicCard} from './card';

/** Build a vCard 3.0 string from a public card. Empty fields are omitted. */
export function buildVCard(card: PublicCard): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.full_name}`,
    card.designation ? `TITLE:${card.designation}` : '',
    card.company ? `ORG:${card.company}` : '',
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
    card.whatsapp ? `TEL;TYPE=WHATSAPP:${card.whatsapp}` : '',
    card.email ? `EMAIL;TYPE=INTERNET:${card.email}` : '',
    card.website ? `URL:${card.website}` : '',
    card.address ? `ADR;TYPE=WORK:;;${card.address.replace(/\n/g, ' ')};;;;` : '',
    card.public_url ? `NOTE:Digital card: ${card.public_url}` : '',
    'END:VCARD',
  ];
  return lines.filter(Boolean).join('\r\n');
}

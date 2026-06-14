import {buildVCard} from '@/lib/vcard';
import type {PublicCard} from '@/lib/card';

function card(overrides: Partial<PublicCard> = {}): PublicCard {
  return {
    slug: 'jane-doe',
    full_name: 'Jane Doe',
    profile_photo: null,
    designation: 'CEO',
    company: 'Acme',
    phone: '+911234567890',
    whatsapp: null,
    email: 'jane@acme.co',
    website: 'acme.co',
    address: null,
    about: null,
    public_url: 'https://dcard.test/c/jane-doe',
    ...overrides,
  };
}

describe('buildVCard', () => {
  it('wraps the card in BEGIN/END and the core fields', () => {
    const v = buildVCard(card());
    expect(v.startsWith('BEGIN:VCARD')).toBe(true);
    expect(v.trim().endsWith('END:VCARD')).toBe(true);
    expect(v).toContain('VERSION:3.0');
    expect(v).toContain('FN:Jane Doe');
    expect(v).toContain('TITLE:CEO');
    expect(v).toContain('ORG:Acme');
    expect(v).toContain('TEL;TYPE=CELL:+911234567890');
    expect(v).toContain('EMAIL;TYPE=INTERNET:jane@acme.co');
    expect(v).toContain('URL:acme.co');
    expect(v).toContain('NOTE:Digital card: https://dcard.test/c/jane-doe');
  });

  it('omits empty fields', () => {
    const v = buildVCard(card({designation: null, company: null, phone: null, email: null, website: null}));
    expect(v).toContain('FN:Jane Doe');
    expect(v).not.toContain('TITLE:');
    expect(v).not.toContain('ORG:');
    expect(v).not.toContain('TEL');
    expect(v).not.toContain('EMAIL');
  });

  it('flattens newlines in the address', () => {
    const v = buildVCard(card({address: '12 Main St\nBengaluru'}));
    expect(v).toContain('ADR;TYPE=WORK:;;12 Main St Bengaluru;;;;');
  });

  it('uses CRLF line endings (vCard spec)', () => {
    expect(buildVCard(card())).toContain('\r\n');
  });
});

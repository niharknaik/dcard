/**
 * @jest-environment node
 */
import {qrDataUrl} from '@/lib/qr';

describe('qrDataUrl', () => {
  it('returns a PNG data URL for a link', async () => {
    const url = await qrDataUrl('https://dcard.test/c/jane');
    expect(url).toMatch(/^data:image\/png;base64,/);
    expect((url ?? '').length).toBeGreaterThan(100);
  });
});

import {getPublicCard} from '@/lib/card';

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('getPublicCard', () => {
  it('returns the unwrapped card on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({data: {slug: 'jane', full_name: 'Jane'}}),
    });
    // Distinct slugs per test avoid React cache() memoisation across cases.
    await expect(getPublicCard('jane-ok')).resolves.toMatchObject({slug: 'jane', full_name: 'Jane'});
  });

  it('returns null on a non-OK response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ok: false, json: async () => ({})});
    await expect(getPublicCard('missing-404')).resolves.toBeNull();
  });

  it('returns null when the request throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));
    await expect(getPublicCard('boom-err')).resolves.toBeNull();
  });
});

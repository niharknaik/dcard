import {cardsApi} from '@/api/cards.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const http = api as jest.Mocked<typeof api>;

// Helper: the API envelope the wrappers unwrap via `data.data`.
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cardsApi', () => {
  it('list() requests /cards with search + per_page and unwraps the array', async () => {
    http.get.mockResolvedValue(envelope([{id: 1}]));
    const result = await cardsApi.list('jane');

    expect(http.get).toHaveBeenCalledWith('/cards', {params: {search: 'jane', per_page: 50}});
    expect(result).toEqual([{id: 1}]);
  });

  it('get() requests /cards/:id', async () => {
    http.get.mockResolvedValue(envelope({id: 7}));
    const result = await cardsApi.get(7);

    expect(http.get).toHaveBeenCalledWith('/cards/7');
    expect(result).toEqual({id: 7});
  });

  it('create() posts the payload to /cards', async () => {
    http.post.mockResolvedValue(envelope({id: 9}));
    const result = await cardsApi.create({full_name: 'New'});

    expect(http.post).toHaveBeenCalledWith('/cards', {full_name: 'New'});
    expect(result).toEqual({id: 9});
  });

  it('update() puts the payload to /cards/:id', async () => {
    http.put.mockResolvedValue(envelope({id: 5}));
    const result = await cardsApi.update(5, {company: 'Acme'});

    expect(http.put).toHaveBeenCalledWith('/cards/5', {company: 'Acme'});
    expect(result).toEqual({id: 5});
  });

  it('remove() deletes /cards/:id', async () => {
    http.delete.mockResolvedValue(envelope(null));
    await cardsApi.remove(5);

    expect(http.delete).toHaveBeenCalledWith('/cards/5');
  });

  it('duplicate() posts to /cards/:id/duplicate', async () => {
    http.post.mockResolvedValue(envelope({id: 6}));
    const result = await cardsApi.duplicate(5);

    expect(http.post).toHaveBeenCalledWith('/cards/5/duplicate');
    expect(result).toEqual({id: 6});
  });

  it('addSocialLink() posts to /cards/:id/social-links', async () => {
    http.post.mockResolvedValue(envelope({id: 11}));
    const result = await cardsApi.addSocialLink(5, {platform: 'LinkedIn', url: 'https://x'});

    expect(http.post).toHaveBeenCalledWith('/cards/5/social-links', {
      platform: 'LinkedIn',
      url: 'https://x',
    });
    expect(result).toEqual({id: 11});
  });

  it('removeSocialLink() deletes /social-links/:id', async () => {
    http.delete.mockResolvedValue(envelope(null));
    await cardsApi.removeSocialLink(11);

    expect(http.delete).toHaveBeenCalledWith('/social-links/11');
  });
});

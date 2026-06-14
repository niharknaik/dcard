import {adsApi} from '@/api/ads.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({api: {get: jest.fn(), post: jest.fn()}}));

const http = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adsApi', () => {
  it('get() fetches /ads and unwraps the payload', async () => {
    http.get.mockResolvedValue({data: {data: {enabled: true}}});
    const result = await adsApi.get();

    expect(http.get).toHaveBeenCalledWith('/ads');
    expect(result).toEqual({enabled: true});
  });

  it('track() posts the event to /ads/:id/track', async () => {
    http.post.mockResolvedValue({data: {}});
    await adsApi.track(7, 'click');

    expect(http.post).toHaveBeenCalledWith('/ads/7/track', {event: 'click'});
  });
});

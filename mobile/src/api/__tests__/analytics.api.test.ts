import {analyticsApi} from '@/api/analytics.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({api: {get: jest.fn()}}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('analyticsApi', () => {
  it('summary() defaults to the daily period', async () => {
    http.get.mockResolvedValue(envelope({period: 'daily'}));
    const result = await analyticsApi.summary();

    expect(http.get).toHaveBeenCalledWith('/analytics/summary', {params: {period: 'daily'}});
    expect(result).toEqual({period: 'daily'});
  });

  it('summary() passes through the requested period', async () => {
    http.get.mockResolvedValue(envelope({period: 'weekly'}));
    await analyticsApi.summary('weekly');

    expect(http.get).toHaveBeenCalledWith('/analytics/summary', {params: {period: 'weekly'}});
  });

  it('card() requests the per-card analytics with the period', async () => {
    http.get.mockResolvedValue(envelope({period: 'monthly'}));
    const result = await analyticsApi.card(7, 'monthly');

    expect(http.get).toHaveBeenCalledWith('/cards/7/analytics', {params: {period: 'monthly'}});
    expect(result).toEqual({period: 'monthly'});
  });
});

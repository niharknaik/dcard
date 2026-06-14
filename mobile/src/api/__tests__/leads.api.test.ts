import {leadsApi} from '@/api/leads.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({api: {get: jest.fn(), patch: jest.fn()}}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('leadsApi', () => {
  it('list() merges params with per_page', async () => {
    http.get.mockResolvedValue(envelope([{id: 1}]));
    const result = await leadsApi.list({search: 'jane', is_read: false});

    expect(http.get).toHaveBeenCalledWith('/leads', {
      params: {search: 'jane', is_read: false, per_page: 50},
    });
    expect(result).toEqual([{id: 1}]);
  });

  it('list() works without params', async () => {
    http.get.mockResolvedValue(envelope([]));
    await leadsApi.list();

    expect(http.get).toHaveBeenCalledWith('/leads', {params: {per_page: 50}});
  });

  it('markRead() patches /leads/:id/read', async () => {
    http.patch.mockResolvedValue(envelope({id: 7, is_read: true}));
    const result = await leadsApi.markRead(7);

    expect(http.patch).toHaveBeenCalledWith('/leads/7/read');
    expect(result).toEqual({id: 7, is_read: true});
  });
});

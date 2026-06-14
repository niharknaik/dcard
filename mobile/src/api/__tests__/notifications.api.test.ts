import {notificationsApi} from '@/api/notifications.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {get: jest.fn(), patch: jest.fn(), delete: jest.fn()},
}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('notificationsApi', () => {
  it('list() requests /notifications with per_page', async () => {
    http.get.mockResolvedValue(envelope([{id: 1}]));
    const result = await notificationsApi.list();

    expect(http.get).toHaveBeenCalledWith('/notifications', {params: {per_page: 50}});
    expect(result).toEqual([{id: 1}]);
  });

  it('unreadCount() unwraps data.data.count', async () => {
    http.get.mockResolvedValue(envelope({count: 4}));
    const result = await notificationsApi.unreadCount();

    expect(http.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result).toBe(4);
  });

  it('markRead() patches /notifications/:id/read', async () => {
    http.patch.mockResolvedValue(envelope(null));
    await notificationsApi.markRead(3);

    expect(http.patch).toHaveBeenCalledWith('/notifications/3/read');
  });

  it('markAllRead() patches /notifications/read-all', async () => {
    http.patch.mockResolvedValue(envelope(null));
    await notificationsApi.markAllRead();

    expect(http.patch).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('remove() deletes /notifications/:id', async () => {
    http.delete.mockResolvedValue(envelope(null));
    await notificationsApi.remove(3);

    expect(http.delete).toHaveBeenCalledWith('/notifications/3');
  });
});

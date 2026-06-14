import {useNotificationStore} from '@/store/notification.store';
import {notificationsApi} from '@/api/notifications.api';
import {AppNotification} from '@/types';

jest.mock('@/api/notifications.api', () => ({
  notificationsApi: {
    list: jest.fn(),
    unreadCount: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    remove: jest.fn(),
  },
}));

const api = notificationsApi as jest.Mocked<typeof notificationsApi>;

function note(id: number, is_read: boolean): AppNotification {
  return {
    id,
    type: 'new_lead',
    type_label: 'New lead',
    title: `Notification ${id}`,
    message: 'body',
    is_read,
    created_at: '2024-01-15T00:00:00Z',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Reset store to its initial state between tests.
  useNotificationStore.setState({items: [], unreadCount: 0, loading: false});
});

describe('notification store', () => {
  it('fetch() loads items and derives the unread count', async () => {
    api.list.mockResolvedValue([note(1, false), note(2, true), note(3, false)]);

    await useNotificationStore.getState().fetch();

    const state = useNotificationStore.getState();
    expect(state.items).toHaveLength(3);
    expect(state.unreadCount).toBe(2);
    expect(state.loading).toBe(false);
  });

  it('markRead() flips the item and decrements the unread count', async () => {
    useNotificationStore.setState({items: [note(1, false), note(2, false)], unreadCount: 2});
    api.markRead.mockResolvedValue();

    await useNotificationStore.getState().markRead(1);

    const state = useNotificationStore.getState();
    expect(api.markRead).toHaveBeenCalledWith(1);
    expect(state.items.find(n => n.id === 1)?.is_read).toBe(true);
    expect(state.unreadCount).toBe(1);
  });

  it('markAllRead() clears the unread count and marks every item read', async () => {
    useNotificationStore.setState({items: [note(1, false), note(2, false)], unreadCount: 2});
    api.markAllRead.mockResolvedValue();

    await useNotificationStore.getState().markAllRead();

    const state = useNotificationStore.getState();
    expect(state.unreadCount).toBe(0);
    expect(state.items.every(n => n.is_read)).toBe(true);
  });

  it('remove() drops the item and decrements unread only for unread items', async () => {
    useNotificationStore.setState({items: [note(1, false), note(2, true)], unreadCount: 1});
    api.remove.mockResolvedValue();

    await useNotificationStore.getState().remove(1);

    const state = useNotificationStore.getState();
    expect(api.remove).toHaveBeenCalledWith(1);
    expect(state.items).toHaveLength(1);
    expect(state.unreadCount).toBe(0);
  });

  it('remove() of a read item leaves the unread count unchanged', async () => {
    useNotificationStore.setState({items: [note(1, false), note(2, true)], unreadCount: 1});
    api.remove.mockResolvedValue();

    await useNotificationStore.getState().remove(2);

    expect(useNotificationStore.getState().unreadCount).toBe(1);
  });
});

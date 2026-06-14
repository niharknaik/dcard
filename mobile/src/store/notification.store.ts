import {create} from 'zustand';
import {notificationsApi} from '@/api/notifications.api';
import {AppNotification} from '@/types';

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({loading: true});
    try {
      const items = await notificationsApi.list();
      set({items, unreadCount: items.filter(n => !n.is_read).length});
    } finally {
      set({loading: false});
    }
  },

  refreshUnread: async () => {
    const unreadCount = await notificationsApi.unreadCount();
    set({unreadCount});
  },

  markRead: async id => {
    await notificationsApi.markRead(id);
    set(state => ({
      items: state.items.map(n => (n.id === id ? {...n, is_read: true} : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    set(state => ({
      items: state.items.map(n => ({...n, is_read: true})),
      unreadCount: 0,
    }));
  },

  remove: async id => {
    await notificationsApi.remove(id);
    set(state => {
      const removed = state.items.find(n => n.id === id);
      return {
        items: state.items.filter(n => n.id !== id),
        unreadCount: removed && !removed.is_read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },
}));

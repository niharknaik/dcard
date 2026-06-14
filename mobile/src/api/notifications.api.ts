import {api} from './client';
import {ApiEnvelope, AppNotification} from '@/types';

export const notificationsApi = {
  async list(): Promise<AppNotification[]> {
    const {data} = await api.get<ApiEnvelope<AppNotification[]>>('/notifications', {
      params: {per_page: 50},
    });
    return data.data;
  },

  async unreadCount(): Promise<number> {
    const {data} = await api.get<ApiEnvelope<{count: number}>>('/notifications/unread-count');
    return data.data.count;
  },

  async markRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};

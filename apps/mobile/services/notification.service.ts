import { api } from './api';
import { Notification } from '@/utils/shared';

export const notificationService = {
  getAll: async (unreadOnly = false): Promise<Notification[]> => {
    const response = await api.get<Notification[]>(
      `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};

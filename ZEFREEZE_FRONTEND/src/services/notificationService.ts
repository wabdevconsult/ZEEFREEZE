import api from '@/lib/axios';  
import { Notification, NotificationPreferences } from '../types/notification';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const res = await api.get('/api/notification');
      return res.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  getUnread: async (): Promise<Notification[]> => {
    try {
      const res = await api.get('/api/notification/unread');
      return res.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },

  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const res = await api.patch(`/api/notification/${id}/read`);
      return res.data;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    try {
      await api.patch('/api/notification/read-all');
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const res = await api.get('/api/notification/preferences');
      return res.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {
        email: true,
        push: true,
        maintenance: true,
        alerts: true,
        messages: true,
        system: true,
      };
    }
  },

  updatePreferences: async (
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    try {
      const res = await api.put('/api/notification/preferences', preferences);
      return res.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const res = await api.get('/api/notification/unread-count');
      return res.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
};
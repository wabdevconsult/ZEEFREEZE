import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';

export const useNotifications = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchNotifications = async () => {
    try {
      const all = await notificationService.getAll();
      const unread = await notificationService.getUnreadCount();
      setNotifications(all);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications :', err);
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !user._id) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return { notifications, unreadCount, loading, error };
};
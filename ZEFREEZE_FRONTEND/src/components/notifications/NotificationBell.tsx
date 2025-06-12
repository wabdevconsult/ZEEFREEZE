import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '../../contexts/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!user?.id) return;
        const response = await api.get('/api/notification/unread-count');
        setUnreadCount(response.data?.count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;

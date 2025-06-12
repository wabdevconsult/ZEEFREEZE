import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/lib/axios'; // ✅ Bon import

const MessageNotification = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!user?.id) return;
        const res = await api.get(`/api/messages/unread-count?recipientId=${user.id}`);
        setUnreadCount(res.data.count);
      } catch (error) {
        console.error("❌ Erreur fetch unread messages:", error);
      }
    };

    fetchUnreadCount();
  }, [user?.id]);

  return (
    <div className="relative">
      <Link to="/messages">
        <Mail className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default MessageNotification;


import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useWebSocket } from '../../hooks/useWebSocket';
import { INotification } from '../../types/notification.types';
import { NotificationType } from '../../types/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  userId: string;
  notifications: NotificationType[];
  onNotificationClick: (notification: NotificationType) => void;
  onNotificationDelete: (notificationId: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  userId,
  notifications,
  onNotificationClick,
  onNotificationDelete,
}) => {
  const { t } = useTranslation();
  const [notificationsState, setNotifications] = useState<INotification[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useWebSocket();

  const fetchNotifications = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/${userId}?limit=20&skip=${page * 20}`);
      const data = await response.json();

      if (page === 0) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }

      setHasMore(data.notifications.length === 20);
    } catch (err) {
      setError(t('notifications.error.loading'));
    } finally {
      setLoading(false);
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: fetchNotifications
  });

  useEffect(() => {
    fetchNotifications(0);

    // WebSocket posluchači pro real-time aktualizace
    socket?.on('new_notification', (notification: INotification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    socket?.on('notifications_read', ({ notificationIds }: { notificationIds: string[] }) => {
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    });

    socket?.on('notifications_deleted', ({ notificationIds }: { notificationIds: string[] }) => {
      setNotifications(prev =>
        prev.filter(notif => !notificationIds.includes(notif._id))
      );
    });

    return () => {
      socket?.off('new_notification');
      socket?.off('notifications_read');
      socket?.off('notifications_deleted');
    };
  }, [userId, socket]);

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await fetch(`/api/notifications/${userId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
    } catch (err) {
      setError(t('notifications.error.markingRead'));
    }
  };

  const handleDelete = async (notificationIds: string[]) => {
    try {
      await fetch(`/api/notifications/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
    } catch (err) {
      setError(t('notifications.error.deleting'));
    }
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (notifications.length === 0 && !loading) {
    return <div className="text-gray-500 p-4">{t('notifications.empty')}</div>;
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          ref={index === notifications.length - 1 ? lastElementRef : null}
        >
          <NotificationItem
            notification={notification}
            onClick={() => onNotificationClick(notification)}
            onDelete={() => onNotificationDelete(notification.id)}
          />
        </div>
      ))}
      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      )}
    </div>
  );
}; 
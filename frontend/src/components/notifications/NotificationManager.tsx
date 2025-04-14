import React, { useEffect, useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NotificationType } from '../../types/notifications';
import { NotificationList } from './NotificationList';
import { NotificationPreferences } from './NotificationPreferences';

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, subscribe } = useWebSocket();
  const { isSupported, permission, requestPermission } = usePushNotifications();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Implementovat načítání notifikací z API
        setIsLoading(false);
      } catch (error) {
        console.error('Chyba při načítání notifikací:', error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isConnected) {
      subscribe('notifications', (data) => {
        setNotifications(prev => [...prev, data]);
      });
    }
  }, [isConnected, subscribe]);

  const handleNotificationClick = (notification: NotificationType) => {
    // TODO: Implementovat akci při kliknutí na notifikaci
  };

  const handleNotificationDelete = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="notification-manager">
      <div className="notification-header">
        <h2>Správa notifikací</h2>
        {isSupported && permission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="btn btn-primary"
          >
            Povolit push notifikace
          </button>
        )}
      </div>

      <NotificationPreferences />

      <div className="notification-content">
        {isLoading ? (
          <div className="loading">Načítání notifikací...</div>
        ) : (
          <NotificationList
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onNotificationDelete={handleNotificationDelete}
          />
        )}
      </div>
    </div>
  );
}; 
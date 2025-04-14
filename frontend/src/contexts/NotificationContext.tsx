import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useWebSocket } from '../hooks/useWebSocket';
import { NotificationType } from '../types/notifications';

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  addNotification: (notification: NotificationType) => void;
  markAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  isPushSupported: boolean;
  pushPermission: NotificationPermission;
  requestPushPermission: () => Promise<void>;
  pushError: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { isConnected, subscribe } = useWebSocket();
  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    requestPermission: requestPushPermission,
    error: pushError,
  } = usePushNotifications();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // TODO: Implementovat načítání notifikací z API
      } catch (error) {
        console.error('Chyba při načítání notifikací:', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe('notifications', (data) => {
        setNotifications(prev => [...prev, data]);
      });

      return () => {
        unsubscribe?.();
      };
    }
  }, [isConnected, subscribe]);

  const addNotification = (notification: NotificationType) => {
    setNotifications(prev => [...prev, notification]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        deleteNotification,
        isPushSupported,
        pushPermission,
        requestPushPermission,
        pushError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 
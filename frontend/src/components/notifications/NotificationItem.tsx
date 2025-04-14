import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { INotification } from '../../types/notification.types';
import { formatDate } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (notificationIds: string[]) => void;
  onDelete: (notificationIds: string[]) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const { t } = useTranslation();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'friend_request':
        return <BellIcon className="h-5 w-5 text-green-500" />;
      case 'system':
        return <BellIcon className="h-5 w-5 text-yellow-500" />;
      case 'security':
        return <BellIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-sm border ${notification.read
        ? 'bg-gray-50 border-gray-200'
        : 'bg-white border-blue-200'
        }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getNotificationIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-gray-900">
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{notification.content}</p>
          {notification.data && (
            <div className="mt-2 text-xs text-gray-500">
              {JSON.stringify(notification.data)}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead([notification._id])}
              className="p-1 text-gray-400 hover:text-green-500"
              title={t('notifications.markAsRead')}
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete([notification._id])}
            className="p-1 text-gray-400 hover:text-red-500"
            title={t('notifications.delete')}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 
import React from 'react';
import { NotificationType } from '../../types/notifications';
import { formatDate } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: NotificationType;
  onClick: () => void;
  onDelete: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete,
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return '💬';
      case 'friend_request':
        return '👤';
      case 'system':
        return '⚙️';
      case 'security':
        return '🔒';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={onClick}
    >
      <div className="notification-icon">{getNotificationIcon()}</div>
      <div className="notification-content">
        <div className="notification-header">
          <h3>{notification.title}</h3>
          <span className="notification-time">
            {formatDate(notification.createdAt)}
          </span>
        </div>
        <p className="notification-message">{notification.message}</p>
      </div>
      <button
        className="notification-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </button>
    </div>
  );
}; 
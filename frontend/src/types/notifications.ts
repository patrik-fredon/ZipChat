export type NotificationType = {
  id: string;
  type: 'message' | 'friend_request' | 'system' | 'security';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
};

export type NotificationPreference = {
  type: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
};

export type QuietHours = {
  enabled: boolean;
  start: string;
  end: string;
}; 
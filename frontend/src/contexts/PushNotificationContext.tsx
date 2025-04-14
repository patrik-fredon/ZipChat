import React, { createContext, ReactNode, useContext } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { logger } from '../utils/logger';

interface PushNotificationContextType {
  isSupported: boolean;
  isPermissionGranted: boolean;
  token: string | null;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<string | null>;
  unregisterToken: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<PushNotificationProviderProps> = ({ children }) => {
  const pushNotifications = usePushNotifications();

  return (
    <PushNotificationContext.Provider value={pushNotifications}>
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    logger.error('usePushNotificationContext must be used within a PushNotificationProvider');
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider');
  }
  return context;
}; 
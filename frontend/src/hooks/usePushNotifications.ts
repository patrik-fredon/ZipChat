import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { logger } from '../utils/logger';

interface PushNotificationState {
  isSupported: boolean;
  isPermissionGranted: boolean;
  token: string | null;
  error: string | null;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isPermissionGranted: false,
    token: null,
    error: null
  });

  const checkSupport = useCallback(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Push notifications are not supported in this browser'
      }));
      return false;
    }
    return true;
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const permission = await Notification.permission;
      setState(prev => ({
        ...prev,
        isPermissionGranted: permission === 'granted'
      }));
      return permission === 'granted';
    } catch (error) {
      logger.error('Error checking notification permission:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check notification permission'
      }));
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      if (!checkSupport()) return false;

      const permission = await Notification.requestPermission();
      const isGranted = permission === 'granted';
      
      setState(prev => ({
        ...prev,
        isPermissionGranted: isGranted
      }));

      return isGranted;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to request notification permission'
      }));
      return false;
    }
  }, [checkSupport]);

  const registerToken = useCallback(async () => {
    try {
      if (!state.isPermissionGranted) {
        const granted = await requestPermission();
        if (!granted) return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const token = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      await api.post('/notifications/fcm-token', {
        token: token.toJSON(),
        deviceId: navigator.userAgent,
        platform: 'web'
      });

      setState(prev => ({
        ...prev,
        token: token.toJSON().endpoint
      }));

      return token.toJSON().endpoint;
    } catch (error) {
      logger.error('Error registering push notification token:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to register push notification token'
      }));
      return null;
    }
  }, [state.isPermissionGranted, requestPermission]);

  const unregisterToken = useCallback(async () => {
    try {
      if (!state.token) return;

      await api.delete('/notifications/fcm-token', {
        data: { token: state.token }
      });

      setState(prev => ({
        ...prev,
        token: null
      }));
    } catch (error) {
      logger.error('Error unregistering push notification token:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to unregister push notification token'
      }));
    }
  }, [state.token]);

  useEffect(() => {
    checkSupport();
    checkPermission();
  }, [checkSupport, checkPermission]);

  return {
    ...state,
    requestPermission,
    registerToken,
    unregisterToken
  };
}; 
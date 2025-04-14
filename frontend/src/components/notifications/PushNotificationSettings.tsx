import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../hooks/useApi';
import { logger } from '../../utils/logger';
import { Button } from '../ui/Button';

interface PushNotificationSettingsProps {
  userId: string;
}

interface FCMToken {
  id: string;
  deviceId: string;
  platform: 'android' | 'ios' | 'web';
  createdAt: string;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({ userId }) => {
  const { t } = useTranslation();
  const api = useApi();
  const [tokens, setTokens] = useState<FCMToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTokens();
  }, [userId]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications/fcm-token');
      setTokens(response.data.tokens);
    } catch (err) {
      logger.error('Chyba při načítání FCM tokenů:', err);
      setError(t('notifications.errors.loadTokens'));
    } finally {
      setIsLoading(false);
    }
  };

  const registerToken = async () => {
    try {
      setIsLoading(true);
      // Získání FCM tokenu z prohlížeče
      const messaging = firebase.messaging();
      const token = await messaging.getToken({
        vapidKey: process.env.VAPID_PUBLIC_KEY
      });

      // Odeslání tokenu na server
      await api.post('/notifications/fcm-token', {
        token,
        deviceId: 'web-browser',
        platform: 'web'
      });

      await loadTokens();
    } catch (err) {
      logger.error('Chyba při registraci FCM tokenu:', err);
      setError(t('notifications.errors.registerToken'));
    } finally {
      setIsLoading(false);
    }
  };

  const removeToken = async (tokenId: string) => {
    try {
      setIsLoading(true);
      await api.delete('/notifications/fcm-token', {
        data: { token: tokenId }
      });
      await loadTokens();
    } catch (err) {
      logger.error('Chyba při odstraňování FCM tokenu:', err);
      setError(t('notifications.errors.removeToken'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t('notifications.pushSettings.title')}</h2>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={registerToken}
          disabled={isLoading}
          variant="primary"
        >
          {t('notifications.pushSettings.registerDevice')}
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">{t('notifications.pushSettings.registeredDevices')}</h3>
        {tokens.length === 0 ? (
          <p className="text-gray-500">{t('notifications.pushSettings.noDevices')}</p>
        ) : (
          <ul className="space-y-2">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{token.deviceId}</p>
                  <p className="text-sm text-gray-500">
                    {t(`notifications.pushSettings.platform.${token.platform}`)}
                  </p>
                </div>
                <Button
                  onClick={() => removeToken(token.id)}
                  disabled={isLoading}
                  variant="danger"
                  size="sm"
                >
                  {t('notifications.pushSettings.removeDevice')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 
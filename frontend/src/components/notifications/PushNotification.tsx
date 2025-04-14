import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { logger } from '../../utils/logger';
import { Button } from '../ui/Button';

interface PushNotificationProps {
  userId: string;
}

export const PushNotification: React.FC<PushNotificationProps> = ({ userId }) => {
  const { t } = useTranslation();
  const {
    isSupported,
    isPermissionGranted,
    token,
    error,
    requestPermission,
    registerToken,
    unregisterToken
  } = usePushNotifications();

  useEffect(() => {
    if (isSupported && !isPermissionGranted) {
      requestPermission();
    }
  }, [isSupported, isPermissionGranted, requestPermission]);

  const handleEnableNotifications = async () => {
    try {
      await registerToken();
    } catch (err) {
      logger.error('Chyba při povolování notifikací:', err);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await unregisterToken();
    } catch (err) {
      logger.error('Chyba při zakazování notifikací:', err);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 rounded-md">
        <p className="text-yellow-800">
          {t('notifications.push.unsupported')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {t('notifications.push.title')}
          </h3>
          <p className="text-sm text-gray-500">
            {token
              ? t('notifications.push.enabled')
              : t('notifications.push.disabled')}
          </p>
        </div>

        {token ? (
          <Button
            onClick={handleDisableNotifications}
            variant="danger"
            size="sm"
          >
            {t('notifications.push.disable')}
          </Button>
        ) : (
          <Button
            onClick={handleEnableNotifications}
            variant="primary"
            size="sm"
            disabled={!isPermissionGranted}
          >
            {t('notifications.push.enable')}
          </Button>
        )}
      </div>

      {!isPermissionGranted && (
        <div className="p-4 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">
            {t('notifications.push.permissionRequired')}
          </p>
          <Button
            onClick={requestPermission}
            variant="secondary"
            size="sm"
            className="mt-2"
          >
            {t('notifications.push.requestPermission')}
          </Button>
        </div>
      )}
    </div>
  );
}; 
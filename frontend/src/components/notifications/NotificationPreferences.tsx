import { Switch } from '@headlessui/react';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationPreferencesProps {
  userId: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    message: boolean;
    friendRequest: boolean;
    system: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/preferences/${userId}`);
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(t('notifications.preferences.error.loading'));
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch(`/api/notifications/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPreferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(t('notifications.preferences.error.updating'));
    }
  };

  if (loading) {
    return <div className="p-4">{t('notifications.preferences.loading')}</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!preferences) {
    return <div className="p-4">{t('notifications.preferences.notFound')}</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-medium">{t('notifications.preferences.title')}</h2>

      {/* Obecná nastavení */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">{t('notifications.preferences.general')}</h3>
        <div className="space-y-2">
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="mr-4">{t('notifications.preferences.email')}</Switch.Label>
              <Switch
                checked={preferences.emailNotifications}
                onChange={(checked) => updatePreferences({ emailNotifications: checked })}
                className={`${preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>

          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="mr-4">{t('notifications.preferences.push')}</Switch.Label>
              <Switch
                checked={preferences.pushNotifications}
                onChange={(checked) => updatePreferences({ pushNotifications: checked })}
                className={`${preferences.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>

          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="mr-4">{t('notifications.preferences.inApp')}</Switch.Label>
              <Switch
                checked={preferences.inAppNotifications}
                onChange={(checked) => updatePreferences({ inAppNotifications: checked })}
                className={`${preferences.inAppNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${preferences.inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>
        </div>
      </div>

      {/* Typy notifikací */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">{t('notifications.preferences.types')}</h3>
        <div className="space-y-2">
          {Object.entries(preferences.notificationTypes).map(([type, enabled]) => (
            <Switch.Group key={type}>
              <div className="flex items-center justify-between">
                <Switch.Label className="mr-4">
                  {t(`notifications.preferences.types.${type}`)}
                </Switch.Label>
                <Switch
                  checked={enabled}
                  onChange={(checked) =>
                    updatePreferences({
                      notificationTypes: {
                        ...preferences.notificationTypes,
                        [type]: checked
                      }
                    })
                  }
                  className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          ))}
        </div>
      </div>

      {/* Tiché hodiny */}
      <div className="space-y-4">
        <h3 className="text-md font-medium">{t('notifications.preferences.quietHours')}</h3>
        <div className="space-y-2">
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="mr-4">{t('notifications.preferences.quietHours.enabled')}</Switch.Label>
              <Switch
                checked={preferences.quietHours.enabled}
                onChange={(checked) =>
                  updatePreferences({
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: checked
                    }
                  })
                }
                className={`${preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>

          {preferences.quietHours.enabled && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MoonIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="time"
                  value={preferences.quietHours.startTime}
                  onChange={(e) =>
                    updatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        startTime: e.target.value
                      }
                    })
                  }
                  className="border rounded px-2 py-1"
                />
              </div>
              <div className="flex items-center">
                <SunIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="time"
                  value={preferences.quietHours.endTime}
                  onChange={(e) =>
                    updatePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        endTime: e.target.value
                      }
                    })
                  }
                  className="border rounded px-2 py-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface NotificationPreference {
  type: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export const NotificationPreferences: React.FC = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    { type: 'message', email: true, push: true, inApp: true },
    { type: 'friend_request', email: true, push: true, inApp: true },
    { type: 'system', email: true, push: false, inApp: true },
    { type: 'security', email: true, push: true, inApp: true },
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '07:00',
  });

  useEffect(() => {
    // TODO: Načíst nastavení z API
  }, []);

  const handlePreferenceChange = (
    type: string,
    channel: 'email' | 'push' | 'inApp',
    value: boolean
  ) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.type === type ? { ...pref, [channel]: value } : pref
      )
    );
  };

  const handleQuietHoursChange = (
    field: 'enabled' | 'start' | 'end',
    value: boolean | string
  ) => {
    setQuietHours(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // TODO: Uložit nastavení do API
      console.log('Nastavení uloženo');
    } catch (error) {
      console.error('Chyba při ukládání nastavení:', error);
    }
  };

  return (
    <div className="notification-preferences">
      <h3>Nastavení notifikací</h3>

      <div className="preferences-list">
        {preferences.map(preference => (
          <div key={preference.type} className="preference-item">
            <h4>{preference.type}</h4>
            <div className="preference-channels">
              <label>
                <input
                  type="checkbox"
                  checked={preference.email}
                  onChange={e =>
                    handlePreferenceChange(preference.type, 'email', e.target.checked)
                  }
                />
                Email
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preference.push}
                  onChange={e =>
                    handlePreferenceChange(preference.type, 'push', e.target.checked)
                  }
                />
                Push
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={preference.inApp}
                  onChange={e =>
                    handlePreferenceChange(preference.type, 'inApp', e.target.checked)
                  }
                />
                V aplikaci
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="quiet-hours">
        <h4>Tiché hodiny</h4>
        <label>
          <input
            type="checkbox"
            checked={quietHours.enabled}
            onChange={e => handleQuietHoursChange('enabled', e.target.checked)}
          />
          Povolit tiché hodiny
        </label>
        {quietHours.enabled && (
          <div className="quiet-hours-time">
            <input
              type="time"
              value={quietHours.start}
              onChange={e => handleQuietHoursChange('start', e.target.value)}
            />
            <span>do</span>
            <input
              type="time"
              value={quietHours.end}
              onChange={e => handleQuietHoursChange('end', e.target.value)}
            />
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleSave}>
        Uložit nastavení
      </button>
    </div>
  );
}; 
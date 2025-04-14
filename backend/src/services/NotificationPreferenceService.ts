import { NotificationPreferenceRepository } from '../repositories/NotificationPreferenceRepository';
import { NotificationPreference } from '../types/notifications';

export class NotificationPreferenceService {
  private repository: NotificationPreferenceRepository;

  constructor() {
    this.repository = new NotificationPreferenceRepository();
  }

  async getPreferences(userId: string) {
    let preferences = await this.repository.findByUserId(userId);

    if (!preferences) {
      // Vytvoření výchozího nastavení, pokud neexistuje
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updatePreferences(userId: string, preferences: Partial<NotificationPreference>) {
    const existingPreferences = await this.repository.findByUserId(userId);

    if (!existingPreferences) {
      throw new Error('Nastavení notifikací nenalezeno');
    }

    return this.repository.update(userId, {
      ...existingPreferences,
      ...preferences,
    });
  }

  private async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    const defaultPreferences: NotificationPreference = {
      userId,
      email: true,
      push: true,
      inApp: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
      notificationTypes: {
        message: true,
        friend_request: true,
        system: true,
        security: true,
      },
    };

    return this.repository.create(defaultPreferences);
  }

  async isNotificationAllowed(
    userId: string,
    type: string,
    channel: 'email' | 'push' | 'inApp'
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    // Kontrola tichých hodin
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);

      if (now >= startTime || now <= endTime) {
        return false;
      }
    }

    // Kontrola typu notifikace
    if (!preferences.notificationTypes[type]) {
      return false;
    }

    // Kontrola kanálu
    return preferences[channel];
  }
} 
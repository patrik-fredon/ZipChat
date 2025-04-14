import { NotificationPreferenceRepository } from '../repositories/NotificationPreferenceRepository';
import { NotificationPreference } from '../types/notifications';
import { logger } from '../utils/logger';

export class NotificationPreferenceService {
  private preferenceRepository: NotificationPreferenceRepository;

  constructor() {
    this.preferenceRepository = new NotificationPreferenceRepository();
  }

  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    try {
      return await this.preferenceRepository.findByUserId(userId);
    } catch (error) {
      logger.error('Chyba při získávání preferencí notifikací:', error);
      throw new Error('Nepodařilo se získat preference notifikací');
    }
  }

  async updatePreferences(userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    try {
      const existingPreferences = await this.preferenceRepository.findByUserId(userId);
      
      if (!existingPreferences) {
        return await this.preferenceRepository.create({
          userId,
          ...preferences
        });
      }

      return await this.preferenceRepository.update(userId, preferences);
    } catch (error) {
      logger.error('Chyba při aktualizaci preferencí notifikací:', error);
      throw new Error('Nepodařilo se aktualizovat preference notifikací');
    }
  }

  async deletePreferences(userId: string): Promise<void> {
    try {
      await this.preferenceRepository.delete(userId);
    } catch (error) {
      logger.error('Chyba při mazání preferencí notifikací:', error);
      throw new Error('Nepodařilo se smazat preference notifikací');
    }
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    try {
      const defaultPreferences: Omit<NotificationPreference, 'id'> = {
        userId,
        email: true,
        push: true,
        inApp: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        notificationTypes: {
          message: true,
          friendRequest: true,
          system: true,
          security: true
        }
      };

      return await this.preferenceRepository.create(defaultPreferences);
    } catch (error) {
      logger.error('Chyba při vytváření výchozích preferencí:', error);
      throw new Error('Nepodařilo se vytvořit výchozí preference');
    }
  }

  async isNotificationAllowed(
    userId: string,
    type: string,
    channel: 'email' | 'push' | 'inApp'
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    // Kontrola tichých hodin
    if (preferences?.quietHours.enabled) {
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
    if (!preferences?.notificationTypes[type]) {
      return false;
    }

    // Kontrola kanálu
    return preferences[channel];
  }
} 
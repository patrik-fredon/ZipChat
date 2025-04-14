import { db } from '../config/database';
import { NotificationPreference } from '../types/notifications';

export class NotificationPreferenceRepository {
  private collection = db.collection('notificationPreferences');

  async findByUserId(userId: string) {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
      return null;
    }

    return {
      userId,
      ...doc.data(),
    } as NotificationPreference;
  }

  async create(preference: Omit<NotificationPreference, 'userId'> & { userId: string }) {
    await this.collection.doc(preference.userId).set(preference);
    return preference as NotificationPreference;
  }

  async update(userId: string, preference: Partial<NotificationPreference>) {
    await this.collection.doc(userId).update(preference);
    return {
      userId,
      ...preference,
    } as NotificationPreference;
  }

  async delete(userId: string) {
    await this.collection.doc(userId).delete();
  }
} 
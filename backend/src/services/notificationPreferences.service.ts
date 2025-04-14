import { z } from 'zod';
import { NotificationPreferences } from '../models/notificationPreferences.model';
import { logger } from '../utils/logger';

export class NotificationPreferencesService {
	/**
	 * Získá notifikační preference uživatele
	 */
	async getPreferences(userId: string) {
		try {
			const preferences = await NotificationPreferences.findOne({ userId });
			if (!preferences) {
				// Vytvoření výchozích preferencí, pokud neexistují
				return await this.createDefaultPreferences(userId);
			}
			return preferences;
		} catch (error) {
			logger.error(`Chyba při získávání notifikačních preferencí pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Aktualizuje notifikační preference uživatele
	 */
	async updatePreferences(userId: string, updateData: Partial<INotificationPreferences>) {
		try {
			const schema = z.object({
				emailNotifications: z.boolean().optional(),
				pushNotifications: z.boolean().optional(),
				inAppNotifications: z.boolean().optional(),
				notificationTypes: z
					.object({
						message: z.boolean().optional(),
						friendRequest: z.boolean().optional(),
						system: z.boolean().optional(),
						security: z.boolean().optional()
					})
					.optional(),
				quietHours: z
					.object({
						enabled: z.boolean().optional(),
						startTime: z.string().optional(),
						endTime: z.string().optional()
					})
					.optional()
			});

			const validatedData = schema.parse(updateData);
			const preferences = await NotificationPreferences.findOneAndUpdate({ userId }, { $set: validatedData }, { new: true, upsert: true });

			return preferences;
		} catch (error) {
			logger.error(`Chyba při aktualizaci notifikačních preferencí pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Vytvoří výchozí notifikační preference pro uživatele
	 */
	private async createDefaultPreferences(userId: string) {
		try {
			const defaultPreferences = {
				userId,
				emailNotifications: true,
				pushNotifications: true,
				inAppNotifications: true,
				notificationTypes: {
					message: true,
					friendRequest: true,
					system: true,
					security: true
				},
				quietHours: {
					enabled: false,
					startTime: '22:00',
					endTime: '08:00'
				}
			};

			const preferences = await NotificationPreferences.create(defaultPreferences);
			return preferences;
		} catch (error) {
			logger.error(`Chyba při vytváření výchozích notifikačních preferencí pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Zkontroluje, zda je notifikace povolena podle preferencí uživatele
	 */
	async isNotificationAllowed(userId: string, type: string): Promise<boolean> {
		try {
			const preferences = await this.getPreferences(userId);

			// Kontrola typu notifikace
			if (!preferences.notificationTypes[type as keyof typeof preferences.notificationTypes]) {
				return false;
			}

			// Kontrola tichých hodin
			if (preferences.quietHours.enabled) {
				const now = new Date();
				const [startHour, startMinute] = preferences.quietHours.startTime.split(':').map(Number);
				const [endHour, endMinute] = preferences.quietHours.endTime.split(':').map(Number);

				const startTime = new Date();
				startTime.setHours(startHour, startMinute, 0, 0);

				const endTime = new Date();
				endTime.setHours(endHour, endMinute, 0, 0);

				if (now >= startTime || now <= endTime) {
					return false;
				}
			}

			return true;
		} catch (error) {
			logger.error(`Chyba při kontrole povolení notifikace pro uživatele ${userId}:`, error);
			return false;
		}
	}
}

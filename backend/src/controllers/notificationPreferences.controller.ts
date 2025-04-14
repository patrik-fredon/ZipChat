import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationPreferencesService } from '../services/notificationPreferences.service';
import { logger } from '../utils/logger';

const preferencesSchema = z.object({
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

export class NotificationPreferencesController {
	constructor(private preferencesService: NotificationPreferencesService) {}

	/**
	 * Získá notifikační preference uživatele
	 */
	async getPreferences(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const preferences = await this.preferencesService.getPreferences(userId);
			res.json(preferences);
		} catch (error) {
			logger.error('Chyba při získávání notifikačních preferencí:', error);
			res.status(500).json({ error: 'Nepodařilo se získat notifikační preference' });
		}
	}

	/**
	 * Aktualizuje notifikační preference uživatele
	 */
	async updatePreferences(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const updateData = preferencesSchema.parse(req.body);
			const preferences = await this.preferencesService.updatePreferences(userId, updateData);
			res.json(preferences);
		} catch (error) {
			if (error instanceof z.ZodError) {
				logger.error('Chyba při validaci dat:', error.errors);
				res.status(400).json({ error: 'Neplatná data', details: error.errors });
			} else {
				logger.error('Chyba při aktualizaci notifikačních preferencí:', error);
				res.status(500).json({ error: 'Nepodařilo se aktualizovat notifikační preference' });
			}
		}
	}
}

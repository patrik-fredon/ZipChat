import { Request, Response } from 'express';
import { z } from 'zod';
import { FCMToken } from '../models/fcmToken.model';
import { logger } from '../utils/logger';

const fcmTokenSchema = z.object({
	token: z.string().min(1),
	deviceId: z.string().min(1),
	platform: z.enum(['android', 'ios', 'web'])
});

export class FCMTokenController {
	/**
	 * Uloží FCM token pro uživatele
	 */
	async saveToken(req: Request, res: Response) {
		try {
			const userId = req.user.id;
			const { token, deviceId, platform } = fcmTokenSchema.parse(req.body);

			// Kontrola existence tokenu
			const existingToken = await FCMToken.findOne({ token });
			if (existingToken) {
				if (existingToken.userId !== userId) {
					// Token patří jinému uživateli - aktualizujeme
					existingToken.userId = userId;
					existingToken.deviceId = deviceId;
					existingToken.platform = platform;
					await existingToken.save();
				}
			} else {
				// Vytvoření nového tokenu
				await FCMToken.create({
					userId,
					token,
					deviceId,
					platform
				});
			}

			res.status(200).json({ message: 'Token úspěšně uložen' });
		} catch (error) {
			logger.error('Chyba při ukládání FCM tokenu:', error);
			res.status(500).json({ error: 'Nepodařilo se uložit token' });
		}
	}

	/**
	 * Odstraní FCM token
	 */
	async removeToken(req: Request, res: Response) {
		try {
			const userId = req.user.id;
			const { token } = req.body;

			await FCMToken.findOneAndDelete({ userId, token });
			res.status(200).json({ message: 'Token úspěšně odstraněn' });
		} catch (error) {
			logger.error('Chyba při odstraňování FCM tokenu:', error);
			res.status(500).json({ error: 'Nepodařilo se odstranit token' });
		}
	}

	/**
	 * Získá FCM tokeny pro uživatele
	 */
	async getTokens(req: Request, res: Response) {
		try {
			const userId = req.user.id;
			const tokens = await FCMToken.find({ userId });
			res.status(200).json({ tokens });
		} catch (error) {
			logger.error('Chyba při získávání FCM tokenů:', error);
			res.status(500).json({ error: 'Nepodařilo se získat tokeny' });
		}
	}
}

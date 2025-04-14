import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/notification.service';
import { logger } from '../utils/logger';

const notificationSchema = z.object({
	userId: z.string().uuid(),
	type: z.enum(['message', 'friend_request', 'system', 'security']),
	title: z.string().min(1),
	content: z.string().min(1),
	data: z.record(z.any()).optional(),
	expiresAt: z.date().optional()
});

export class NotificationController {
	constructor(private notificationService: NotificationService) {}

	/**
	 * Vytvoří novou notifikaci
	 */
	async createNotification(req: Request, res: Response) {
		try {
			const notificationData = notificationSchema.parse(req.body);
			const notification = await this.notificationService.createNotification(notificationData);
			res.status(201).json(notification);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: error.errors });
			}
			logger.error('Chyba při vytváření notifikace:', error);
			res.status(500).json({ error: 'Nepodařilo se vytvořit notifikaci' });
		}
	}

	/**
	 * Získá notifikace pro uživatele
	 */
	async getNotifications(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const { limit = 20, skip = 0, read, type } = req.query;

			const options = {
				limit: Number(limit),
				skip: Number(skip),
				read: read !== undefined ? read === 'true' : undefined,
				type: type as 'message' | 'friend_request' | 'system' | 'security' | undefined
			};

			const result = await this.notificationService.getNotifications(userId, options);
			res.json(result);
		} catch (error) {
			logger.error('Chyba při získávání notifikací:', error);
			res.status(500).json({ error: 'Nepodařilo se získat notifikace' });
		}
	}

	/**
	 * Označí notifikace jako přečtené
	 */
	async markAsRead(req: Request, res: Response) {
		try {
			const { notificationIds } = req.body;
			const userId = req.params.userId;

			await this.notificationService.markAsRead(notificationIds, userId);
			res.status(200).json({ success: true });
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: error.errors });
			}
			logger.error('Chyba při označování notifikací jako přečtené:', error);
			res.status(500).json({ error: 'Nepodařilo se označit notifikace jako přečtené' });
		}
	}

	/**
	 * Smaže notifikace
	 */
	async deleteNotifications(req: Request, res: Response) {
		try {
			const { notificationIds } = req.body;
			const userId = req.params.userId;

			await this.notificationService.deleteNotifications(notificationIds, userId);
			res.status(200).json({ success: true });
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: error.errors });
			}
			logger.error('Chyba při mazání notifikací:', error);
			res.status(500).json({ error: 'Nepodařilo se smazat notifikace' });
		}
	}

	/**
	 * Získá počet nepřečtených notifikací
	 */
	async getUnreadCount(req: Request, res: Response) {
		try {
			const userId = req.params.userId;
			const count = await this.notificationService.getUnreadCount(userId);
			res.json({ count });
		} catch (error) {
			logger.error('Chyba při získávání počtu nepřečtených notifikací:', error);
			res.status(500).json({ error: 'Nepodařilo se získat počet nepřečtených notifikací' });
		}
	}
}

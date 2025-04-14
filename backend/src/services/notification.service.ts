import { z } from 'zod';
import { INotification, Notification } from '../models/notification.model';
import { logger } from '../utils/logger';
import { NotificationPreferencesService } from './notificationPreferences.service';
import { WebSocketService } from './websocket.service';

export class NotificationService {
	constructor(private webSocketService: WebSocketService, private notificationPreferencesService: NotificationPreferencesService) {}

	/**
	 * Vytvoří novou notifikaci
	 */
	async createNotification(notificationData: Omit<INotification, 'read' | 'readAt' | 'createdAt'>): Promise<INotification> {
		try {
			// Validace vstupních dat
			const schema = z.object({
				userId: z.string().uuid(),
				type: z.enum(['message', 'friend_request', 'system', 'security']),
				title: z.string().min(1),
				content: z.string().min(1),
				data: z.record(z.any()).optional(),
				expiresAt: z.date().optional()
			});

			const validatedData = schema.parse(notificationData);

			// Kontrola notifikačních preferencí
			const isAllowed = await this.notificationPreferencesService.isNotificationAllowed(validatedData.userId, validatedData.type);

			if (!isAllowed) {
				logger.info(`Notifikace typu ${validatedData.type} není povolena pro uživatele ${validatedData.userId}`);
				return null;
			}

			// Vytvoření notifikace
			const notification = await Notification.create({
				...validatedData,
				read: false
			});

			// Odeslání notifikace přes WebSocket
			this.webSocketService.notifyUser(notification.userId, 'new_notification', notification);

			return notification;
		} catch (error) {
			logger.error('Chyba při vytváření notifikace:', error);
			throw error;
		}
	}

	/**
	 * Získá notifikace pro uživatele
	 */
	async getNotifications(
		userId: string,
		options: {
			limit?: number;
			skip?: number;
			read?: boolean;
			type?: INotification['type'];
		} = {}
	): Promise<{ notifications: INotification[]; total: number }> {
		try {
			const { limit = 20, skip = 0, read, type } = options;

			// Sestavení dotazu
			const query: any = { userId };
			if (read !== undefined) query.read = read;
			if (type) query.type = type;

			// Získání notifikací
			const [notifications, total] = await Promise.all([Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit), Notification.countDocuments(query)]);

			return { notifications, total };
		} catch (error) {
			logger.error(`Chyba při získávání notifikací pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Označí notifikace jako přečtené
	 */
	async markAsRead(notificationIds: string[], userId: string): Promise<void> {
		try {
			// Validace vstupních dat
			const schema = z.object({
				notificationIds: z.array(z.string().uuid()),
				userId: z.string().uuid()
			});
			schema.parse({ notificationIds, userId });

			// Aktualizace notifikací
			await Notification.updateMany(
				{
					_id: { $in: notificationIds },
					userId,
					read: false
				},
				{
					$set: {
						read: true,
						readAt: new Date()
					}
				}
			);

			// Odeslání aktualizace přes WebSocket
			this.webSocketService.notifyUser(userId, 'notifications_read', { notificationIds });
		} catch (error) {
			logger.error(`Chyba při označování notifikací jako přečtené pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Smaže notifikace
	 */
	async deleteNotifications(notificationIds: string[], userId: string): Promise<void> {
		try {
			// Validace vstupních dat
			const schema = z.object({
				notificationIds: z.array(z.string().uuid()),
				userId: z.string().uuid()
			});
			schema.parse({ notificationIds, userId });

			// Smazání notifikací
			await Notification.deleteMany({
				_id: { $in: notificationIds },
				userId
			});

			// Odeslání aktualizace přes WebSocket
			this.webSocketService.notifyUser(userId, 'notifications_deleted', { notificationIds });
		} catch (error) {
			logger.error(`Chyba při mazání notifikací pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Získá počet nepřečtených notifikací
	 */
	async getUnreadCount(userId: string): Promise<number> {
		try {
			return await Notification.countDocuments({
				userId,
				read: false
			});
		} catch (error) {
			logger.error(`Chyba při získávání počtu nepřečtených notifikací pro uživatele ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Vyčistí expirované notifikace
	 */
	async cleanupExpiredNotifications(): Promise<void> {
		try {
			const result = await Notification.deleteMany({
				expiresAt: { $lt: new Date() }
			});

			logger.info(`Vyčištěno ${result.deletedCount} expirovaných notifikací`);
		} catch (error) {
			logger.error('Chyba při čištění expirovaných notifikací:', error);
			throw error;
		}
	}
}

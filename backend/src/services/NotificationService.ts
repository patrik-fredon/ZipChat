import { INotification, NotificationType } from '../interfaces/INotification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { logger } from '../utils/logger';
import { WebSocketService } from './websocket.service';

export class NotificationService {
	private webSocketService: WebSocketService;
	private notificationRepository: NotificationRepository;

	constructor() {
		this.webSocketService = new WebSocketService();
		this.notificationRepository = new NotificationRepository();
	}

	async createNotification(userId: string, type: NotificationType, title: string, message: string, data?: any): Promise<INotification> {
		try {
			const notification = await this.notificationRepository.create({
				userId,
				type,
				title,
				message,
				data,
				isRead: false,
				createdAt: new Date()
			});

			// Odeslání notifikace přes WebSocket
			await this.sendNotificationToUser(userId, notification);

			logger.info(`Notifikace vytvořena pro uživatele ID: ${userId}`);
			return notification;
		} catch (error) {
			logger.error('Chyba při vytváření notifikace:', error);
			throw error;
		}
	}

	async getNotifications(
		userId: string,
		page: number = 1,
		limit: number = 20
	): Promise<{
		notifications: INotification[];
		total: number;
		unreadCount: number;
	}> {
		try {
			const [notifications, total, unreadCount] = await Promise.all([
				this.notificationRepository.findByUserId(userId, page, limit),
				this.notificationRepository.countByUserId(userId),
				this.notificationRepository.countUnreadByUserId(userId)
			]);

			return { notifications, total, unreadCount };
		} catch (error) {
			logger.error(`Chyba při získávání notifikací pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	async markAsRead(notificationId: string, userId: string): Promise<INotification> {
		try {
			const notification = await this.notificationRepository.findById(notificationId);

			if (!notification || notification.userId !== userId) {
				throw new Error('Notifikace nenalezena');
			}

			notification.isRead = true;
			notification.readAt = new Date();

			await this.notificationRepository.update(notification);

			// Aktualizace počtu nepřečtených notifikací přes WebSocket
			const unreadCount = await this.notificationRepository.countUnreadByUserId(userId);
			await this.sendUnreadCountToUser(userId, unreadCount);

			logger.info(`Notifikace označena jako přečtená: ${notificationId}`);
			return notification;
		} catch (error) {
			logger.error('Chyba při označování notifikace jako přečtené:', error);
			throw error;
		}
	}

	async markAllAsRead(userId: string): Promise<void> {
		try {
			await this.notificationRepository.markAllAsRead(userId);

			// Aktualizace počtu nepřečtených notifikací přes WebSocket
			await this.sendUnreadCountToUser(userId, 0);

			logger.info(`Všechny notifikace označeny jako přečtené pro uživatele ID: ${userId}`);
		} catch (error) {
			logger.error('Chyba při označování všech notifikací jako přečtené:', error);
			throw error;
		}
	}

	async deleteNotification(notificationId: string, userId: string): Promise<void> {
		try {
			const notification = await this.notificationRepository.findById(notificationId);

			if (!notification || notification.userId !== userId) {
				throw new Error('Notifikace nenalezena');
			}

			await this.notificationRepository.delete(notificationId);

			// Aktualizace počtu nepřečtených notifikací přes WebSocket
			if (!notification.isRead) {
				const unreadCount = await this.notificationRepository.countUnreadByUserId(userId);
				await this.sendUnreadCountToUser(userId, unreadCount);
			}

			logger.info(`Notifikace smazána: ${notificationId}`);
		} catch (error) {
			logger.error('Chyba při mazání notifikace:', error);
			throw error;
		}
	}

	async deleteAllNotifications(userId: string): Promise<void> {
		try {
			await this.notificationRepository.deleteAllByUserId(userId);

			// Aktualizace počtu nepřečtených notifikací přes WebSocket
			await this.sendUnreadCountToUser(userId, 0);

			logger.info(`Všechny notifikace smazány pro uživatele ID: ${userId}`);
		} catch (error) {
			logger.error('Chyba při mazání všech notifikací:', error);
			throw error;
		}
	}

	private async sendNotificationToUser(userId: string, notification: INotification): Promise<void> {
		try {
			await this.webSocketService.sendToUser(userId, 'notification', {
				type: 'NEW_NOTIFICATION',
				notification
			});
		} catch (error) {
			logger.error('Chyba při odesílání notifikace přes WebSocket:', error);
			// Nezastavujeme proces kvůli chybě WebSocket
		}
	}

	private async sendUnreadCountToUser(userId: string, unreadCount: number): Promise<void> {
		try {
			await this.webSocketService.sendToUser(userId, 'notification', {
				type: 'UNREAD_COUNT_UPDATE',
				unreadCount
			});
		} catch (error) {
			logger.error('Chyba při odesílání počtu nepřečtených notifikací přes WebSocket:', error);
			// Nezastavujeme proces kvůli chybě WebSocket
		}
	}
}

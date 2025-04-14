import { INotification, NotificationType } from '../interfaces/INotification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { logger } from '../utils/logger';
import { WebSocketService } from './WebSocketService';

export class NotificationService {
	private repository: NotificationRepository;
	private webSocketService: WebSocketService;

	constructor() {
		this.repository = new NotificationRepository();
		this.webSocketService = WebSocketService.getInstance();
	}

	async createNotification(notification: Omit<NotificationType, 'id' | 'createdAt' | 'read'>): Promise<INotification> {
		try {
			const createdNotification = await this.repository.create(notification);
			
			// Odeslání real-time notifikace přes WebSocket
			this.webSocketService.sendToUser(
				notification.userId,
				'notification',
				createdNotification
			);

			logger.info(`Notifikace vytvořena pro uživatele ID: ${notification.userId}`);
			return createdNotification;
		} catch (error) {
			logger.error('Chyba při vytváření notifikace:', error);
			throw error;
		}
	}

	async getNotifications(userId: string, page: number, limit: number) {
		const skip = (page - 1) * limit;
		return this.repository.findByUserId(userId, skip, limit);
	}

	async getUnreadCount(userId: string) {
		return this.repository.countUnread(userId);
	}

	async markAsRead(userId: string, notificationId: string) {
		const notification = await this.repository.findById(notificationId);
		if (!notification || notification.userId !== userId) {
			throw new Error('Notifikace nenalezena');
		}

		await this.repository.markAsRead(notificationId);
	}

	async deleteNotification(userId: string, notificationId: string) {
		const notification = await this.repository.findById(notificationId);
		if (!notification || notification.userId !== userId) {
			throw new Error('Notifikace nenalezena');
		}

		await this.repository.delete(notificationId);
	}

	async cleanupExpiredNotifications() {
		const expiredDate = new Date();
		expiredDate.setDate(expiredDate.getDate() - 30); // Notifikace starší 30 dní
		await this.repository.deleteExpired(expiredDate);
	}
}

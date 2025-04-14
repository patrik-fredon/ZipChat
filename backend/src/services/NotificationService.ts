import { NotificationRepository } from '../repositories/NotificationRepository';
import { NotificationType } from '../types/notifications';
import { logger } from '../utils/logger';

export class NotificationService {
	private notificationRepository: NotificationRepository;

	constructor() {
		this.notificationRepository = new NotificationRepository();
	}

	async createNotification(notification: Omit<NotificationType, 'id' | 'createdAt' | 'read'>): Promise<NotificationType> {
		try {
			return await this.notificationRepository.create(notification);
		} catch (error) {
			logger.error('Chyba při vytváření notifikace:', error);
			throw new Error('Nepodařilo se vytvořit notifikaci');
		}
	}

	async getNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<NotificationType[]> {
		try {
			return await this.notificationRepository.findByUserId(userId, limit, offset);
		} catch (error) {
			logger.error('Chyba při získávání notifikací:', error);
			throw new Error('Nepodařilo se získat notifikace');
		}
	}

	async markAsRead(notificationId: string): Promise<void> {
		try {
			await this.notificationRepository.update(notificationId, { read: true });
		} catch (error) {
			logger.error('Chyba při označení notifikace jako přečtené:', error);
			throw new Error('Nepodařilo se označit notifikaci jako přečtenou');
		}
	}

	async deleteNotification(notificationId: string): Promise<void> {
		try {
			await this.notificationRepository.delete(notificationId);
		} catch (error) {
			logger.error('Chyba při mazání notifikace:', error);
			throw new Error('Nepodařilo se smazat notifikaci');
		}
	}

	async getUnreadCount(userId: string): Promise<number> {
		try {
			return await this.notificationRepository.getUnreadCount(userId);
		} catch (error) {
			logger.error('Chyba při získávání počtu nepřečtených notifikací:', error);
			throw new Error('Nepodařilo se získat počet nepřečtených notifikací');
		}
	}
}

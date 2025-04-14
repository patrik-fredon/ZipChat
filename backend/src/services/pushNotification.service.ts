import admin from 'firebase-admin';
import { INotification } from '../interfaces/INotification';
import { logger } from '../utils/logger';
import { NotificationPreferencesService } from './notificationPreferences.service';

export class PushNotificationService {
	private fcm: admin.messaging.Messaging;
	private notificationPreferencesService: NotificationPreferencesService;

	constructor() {
		this.fcm = admin.messaging();
		this.notificationPreferencesService = new NotificationPreferencesService();
	}

	/**
	 * Odešle push notifikaci uživateli
	 */
	async sendPushNotification(userId: string, notification: INotification, deviceToken: string): Promise<void> {
		try {
			// Kontrola notifikačních preferencí
			const isAllowed = await this.notificationPreferencesService.isNotificationAllowed(userId, notification.type);

			if (!isAllowed) {
				logger.info(`Push notifikace typu ${notification.type} není povolena pro uživatele ${userId}`);
				return;
			}

			// Vytvoření FCM zprávy
			const message: admin.messaging.Message = {
				token: deviceToken,
				notification: {
					title: notification.title,
					body: notification.message
				},
				data: {
					notificationId: notification.id,
					type: notification.type,
					...notification.data
				},
				android: {
					priority: 'high'
				},
				apns: {
					payload: {
						aps: {
							sound: 'default',
							badge: 1
						}
					}
				}
			};

			// Odeslání notifikace
			await this.fcm.send(message);
			logger.info(`Push notifikace odeslána uživateli ${userId}`);
		} catch (error) {
			logger.error(`Chyba při odesílání push notifikace uživateli ${userId}:`, error);
			throw error;
		}
	}

	/**
	 * Odešle push notifikaci více uživatelům
	 */
	async sendMulticastPushNotification(userIds: string[], notification: INotification, deviceTokens: string[]): Promise<void> {
		try {
			// Kontrola notifikačních preferencí pro všechny uživatele
			const allowedUserIds = await Promise.all(
				userIds.map(async (userId) => {
					const isAllowed = await this.notificationPreferencesService.isNotificationAllowed(userId, notification.type);
					return isAllowed ? userId : null;
				})
			);

			const validUserIds = allowedUserIds.filter((id): id is string => id !== null);

			if (validUserIds.length === 0) {
				logger.info('Žádný uživatel nemá povoleny push notifikace pro tento typ');
				return;
			}

			// Vytvoření FCM zprávy
			const message: admin.messaging.MulticastMessage = {
				tokens: deviceTokens,
				notification: {
					title: notification.title,
					body: notification.message
				},
				data: {
					notificationId: notification.id,
					type: notification.type,
					...notification.data
				},
				android: {
					priority: 'high'
				},
				apns: {
					payload: {
						aps: {
							sound: 'default',
							badge: 1
						}
					}
				}
			};

			// Odeslání notifikací
			await this.fcm.sendMulticast(message);
			logger.info(`Push notifikace odeslány ${validUserIds.length} uživatelům`);
		} catch (error) {
			logger.error('Chyba při odesílání multicast push notifikací:', error);
			throw error;
		}
	}
}

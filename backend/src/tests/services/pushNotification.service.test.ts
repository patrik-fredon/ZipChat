import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INotification } from '../../interfaces/INotification';
import { NotificationPreferencesService } from '../../services/notificationPreferences.service';
import { PushNotificationService } from '../../services/pushNotification.service';

// Mock Firebase Admin
vi.mock('firebase-admin', () => ({
	messaging: () => ({
		send: vi.fn(),
		sendMulticast: vi.fn()
	})
}));

describe('PushNotificationService', () => {
	let pushNotificationService: PushNotificationService;
	let mockNotificationPreferencesService: NotificationPreferencesService;

	beforeEach(() => {
		mockNotificationPreferencesService = {
			isNotificationAllowed: vi.fn()
		} as any;

		pushNotificationService = new PushNotificationService();
		(pushNotificationService as any).notificationPreferencesService = mockNotificationPreferencesService;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('sendPushNotification', () => {
		it('should send push notification when allowed by preferences', async () => {
			// Arrange
			const userId = 'user123';
			const deviceToken = 'token123';
			const notification: INotification = {
				id: 'notif123',
				userId,
				type: 'message',
				title: 'Test',
				message: 'Test message',
				isRead: false,
				createdAt: new Date()
			};

			vi.mocked(mockNotificationPreferencesService.isNotificationAllowed).mockResolvedValue(true);

			// Act
			await pushNotificationService.sendPushNotification(userId, notification, deviceToken);

			// Assert
			expect(mockNotificationPreferencesService.isNotificationAllowed).toHaveBeenCalledWith(userId, notification.type);
			// Add more assertions for FCM message sending
		});

		it('should not send push notification when not allowed by preferences', async () => {
			// Arrange
			const userId = 'user123';
			const deviceToken = 'token123';
			const notification: INotification = {
				id: 'notif123',
				userId,
				type: 'message',
				title: 'Test',
				message: 'Test message',
				isRead: false,
				createdAt: new Date()
			};

			vi.mocked(mockNotificationPreferencesService.isNotificationAllowed).mockResolvedValue(false);

			// Act
			await pushNotificationService.sendPushNotification(userId, notification, deviceToken);

			// Assert
			expect(mockNotificationPreferencesService.isNotificationAllowed).toHaveBeenCalledWith(userId, notification.type);
			// Add assertions to verify no FCM message was sent
		});
	});

	describe('sendMulticastPushNotification', () => {
		it('should send multicast push notifications to allowed users', async () => {
			// Arrange
			const userIds = ['user1', 'user2', 'user3'];
			const deviceTokens = ['token1', 'token2', 'token3'];
			const notification: INotification = {
				id: 'notif123',
				userId: userIds[0],
				type: 'message',
				title: 'Test',
				message: 'Test message',
				isRead: false,
				createdAt: new Date()
			};

			vi.mocked(mockNotificationPreferencesService.isNotificationAllowed).mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

			// Act
			await pushNotificationService.sendMulticastPushNotification(userIds, notification, deviceTokens);

			// Assert
			expect(mockNotificationPreferencesService.isNotificationAllowed).toHaveBeenCalledTimes(3);
			// Add assertions for FCM multicast message sending
		});

		it('should not send multicast push notifications when no users are allowed', async () => {
			// Arrange
			const userIds = ['user1', 'user2'];
			const deviceTokens = ['token1', 'token2'];
			const notification: INotification = {
				id: 'notif123',
				userId: userIds[0],
				type: 'message',
				title: 'Test',
				message: 'Test message',
				isRead: false,
				createdAt: new Date()
			};

			vi.mocked(mockNotificationPreferencesService.isNotificationAllowed).mockResolvedValue(false);

			// Act
			await pushNotificationService.sendMulticastPushNotification(userIds, notification, deviceTokens);

			// Assert
			expect(mockNotificationPreferencesService.isNotificationAllowed).toHaveBeenCalledTimes(2);
			// Add assertions to verify no FCM message was sent
		});
	});
});

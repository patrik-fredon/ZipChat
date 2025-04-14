import fetch from 'node-fetch';
import { User } from '../../models/user.model';
import { PushNotificationService } from '../pushNotification.service';

jest.mock('node-fetch');
jest.mock('../../models/user.model');

describe('PushNotificationService', () => {
	let service: PushNotificationService;
	const mockUser = {
		_id: '123',
		pushSubscription: {
			endpoint: 'https://fcm.googleapis.com/fcm/send/test',
			keys: {
				p256dh: 'test-key',
				auth: 'test-auth'
			}
		}
	};

	beforeEach(() => {
		service = new PushNotificationService();
		process.env.VAPID_PUBLIC_KEY = 'test-public-key';
		process.env.VAPID_PRIVATE_KEY = 'test-private-key';
		process.env.FCM_SERVER_KEY = 'test-server-key';
		(User.findById as jest.Mock).mockResolvedValue(mockUser);
		(fetch as jest.Mock).mockResolvedValue({ ok: true });
	});

	describe('sendPushNotification', () => {
		it('should send push notification to user with subscription', async () => {
			const notification = {
				title: 'Test',
				body: 'Test notification',
				data: { test: 'data' }
			};

			await service.sendPushNotification('123', notification);

			expect(fetch).toHaveBeenCalledWith('https://fcm.googleapis.com/fcm/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'key=test-server-key'
				},
				body: JSON.stringify({
					to: mockUser.pushSubscription.endpoint,
					notification: {
						title: notification.title,
						body: notification.body
					},
					data: notification.data
				})
			});
		});

		it('should not send notification if user has no subscription', async () => {
			(User.findById as jest.Mock).mockResolvedValue({ ...mockUser, pushSubscription: null });

			await service.sendPushNotification('123', {
				title: 'Test',
				body: 'Test notification'
			});

			expect(fetch).not.toHaveBeenCalled();
		});

		it('should throw error if notification sending fails', async () => {
			(fetch as jest.Mock).mockResolvedValue({ ok: false, statusText: 'Error' });

			await expect(
				service.sendPushNotification('123', {
					title: 'Test',
					body: 'Test notification'
				})
			).rejects.toThrow('Chyba při odesílání push notifikace: Error');
		});
	});

	describe('savePushSubscription', () => {
		it('should save push subscription for user', async () => {
			const subscription = {
				endpoint: 'https://test.com',
				keys: {
					p256dh: 'test-key',
					auth: 'test-auth'
				}
			};

			await service.savePushSubscription('123', subscription);

			expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', {
				pushSubscription: subscription
			});
		});
	});

	describe('removePushSubscription', () => {
		it('should remove push subscription for user', async () => {
			await service.removePushSubscription('123');

			expect(User.findByIdAndUpdate).toHaveBeenCalledWith('123', {
				$unset: { pushSubscription: 1 }
			});
		});
	});

	describe('getVapidPublicKey', () => {
		it('should return VAPID public key', () => {
			expect(service.getVapidPublicKey()).toBe('test-public-key');
		});
	});
});

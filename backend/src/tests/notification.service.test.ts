import { Notification } from '../models/notification.model';
import { NotificationService } from '../services/notification.service';
import { WebSocketService } from '../services/websocket.service';

jest.mock('../models/notification.model');
jest.mock('../services/websocket.service');

describe('NotificationService', () => {
	let notificationService: NotificationService;
	let webSocketService: WebSocketService;

	beforeEach(() => {
		webSocketService = new WebSocketService({} as any);
		notificationService = new NotificationService(webSocketService);
	});

	describe('createNotification', () => {
		it('should create a notification successfully', async () => {
			const notificationData = {
				userId: 'user123',
				type: 'message',
				title: 'New Message',
				content: 'You have a new message',
				data: { messageId: 'msg123' }
			};

			const createdNotification = {
				...notificationData,
				read: false,
				createdAt: new Date()
			};

			(Notification.create as jest.Mock).mockResolvedValue(createdNotification);

			const result = await notificationService.createNotification(notificationData);

			expect(Notification.create).toHaveBeenCalledWith({
				...notificationData,
				read: false
			});
			expect(webSocketService.notifyUser).toHaveBeenCalledWith(notificationData.userId, 'new_notification', createdNotification);
			expect(result).toEqual(createdNotification);
		});

		it('should handle validation errors', async () => {
			const invalidData = {
				userId: 'invalid',
				type: 'invalid',
				title: '',
				content: ''
			};

			await expect(notificationService.createNotification(invalidData as any)).rejects.toThrow();
		});
	});

	describe('getNotifications', () => {
		it('should get notifications with default options', async () => {
			const userId = 'user123';
			const notifications = [{ id: '1' }, { id: '2' }];
			const total = 2;

			(Notification.find as jest.Mock).mockReturnValue({
				sort: jest.fn().mockReturnThis(),
				skip: jest.fn().mockReturnThis(),
				limit: jest.fn().mockResolvedValue(notifications)
			});
			(Notification.countDocuments as jest.Mock).mockResolvedValue(total);

			const result = await notificationService.getNotifications(userId);

			expect(result).toEqual({ notifications, total });
			expect(Notification.find).toHaveBeenCalledWith({ userId });
		});

		it('should get notifications with custom options', async () => {
			const userId = 'user123';
			const options = {
				limit: 10,
				skip: 20,
				read: true,
				type: 'message'
			};

			await notificationService.getNotifications(userId, options);

			expect(Notification.find).toHaveBeenCalledWith({
				userId,
				read: true,
				type: 'message'
			});
		});
	});

	describe('markAsRead', () => {
		it('should mark notifications as read', async () => {
			const notificationIds = ['1', '2'];
			const userId = 'user123';

			await notificationService.markAsRead(notificationIds, userId);

			expect(Notification.updateMany).toHaveBeenCalledWith(
				{
					_id: { $in: notificationIds },
					userId,
					read: false
				},
				{
					$set: {
						read: true,
						readAt: expect.any(Date)
					}
				}
			);
			expect(webSocketService.notifyUser).toHaveBeenCalledWith(userId, 'notifications_read', { notificationIds });
		});
	});

	describe('deleteNotifications', () => {
		it('should delete notifications', async () => {
			const notificationIds = ['1', '2'];
			const userId = 'user123';

			await notificationService.deleteNotifications(notificationIds, userId);

			expect(Notification.deleteMany).toHaveBeenCalledWith({
				_id: { $in: notificationIds },
				userId
			});
			expect(webSocketService.notifyUser).toHaveBeenCalledWith(userId, 'notifications_deleted', { notificationIds });
		});
	});

	describe('getUnreadCount', () => {
		it('should get unread notifications count', async () => {
			const userId = 'user123';
			const count = 5;

			(Notification.countDocuments as jest.Mock).mockResolvedValue(count);

			const result = await notificationService.getUnreadCount(userId);

			expect(result).toBe(count);
			expect(Notification.countDocuments).toHaveBeenCalledWith({
				userId,
				read: false
			});
		});
	});

	describe('cleanupExpiredNotifications', () => {
		it('should cleanup expired notifications', async () => {
			const deletedCount = 3;

			(Notification.deleteMany as jest.Mock).mockResolvedValue({ deletedCount });

			await notificationService.cleanupExpiredNotifications();

			expect(Notification.deleteMany).toHaveBeenCalledWith({
				expiresAt: { $lt: expect.any(Date) }
			});
		});
	});
});

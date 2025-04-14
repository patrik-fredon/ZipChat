import { Request, Response } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { WebSocketService } from '../services/websocket.service';

jest.mock('../services/notification.service');
jest.mock('../services/websocket.service');

describe('NotificationController', () => {
	let notificationController: NotificationController;
	let notificationService: NotificationService;
	let req: Partial<Request>;
	let res: Partial<Response>;

	beforeEach(() => {
		notificationService = new NotificationService({} as WebSocketService);
		notificationController = new NotificationController(notificationService);

		req = {
			body: {},
			params: {},
			query: {}
		};

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
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

			req.body = notificationData;

			const createdNotification = {
				...notificationData,
				read: false,
				createdAt: new Date()
			};

			(notificationService.createNotification as jest.Mock).mockResolvedValue(createdNotification);

			await notificationController.createNotification(req as Request, res as Response);

			expect(notificationService.createNotification).toHaveBeenCalledWith(notificationData);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(createdNotification);
		});

		it('should handle validation errors', async () => {
			req.body = {
				userId: 'invalid',
				type: 'invalid',
				title: '',
				content: ''
			};

			await notificationController.createNotification(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.any(Array)
				})
			);
		});

		it('should handle service errors', async () => {
			req.body = {
				userId: 'user123',
				type: 'message',
				title: 'New Message',
				content: 'You have a new message'
			};

			(notificationService.createNotification as jest.Mock).mockRejectedValue(new Error('Service error'));

			await notificationController.createNotification(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Nepodařilo se vytvořit notifikaci' });
		});
	});

	describe('getNotifications', () => {
		it('should get notifications with default options', async () => {
			req.params = { userId: 'user123' };

			const notifications = [{ id: '1' }, { id: '2' }];
			const total = 2;

			(notificationService.getNotifications as jest.Mock).mockResolvedValue({ notifications, total });

			await notificationController.getNotifications(req as Request, res as Response);

			expect(notificationService.getNotifications).toHaveBeenCalledWith('user123', {
				limit: 20,
				skip: 0
			});
			expect(res.json).toHaveBeenCalledWith({ notifications, total });
		});

		it('should get notifications with custom options', async () => {
			req.params = { userId: 'user123' };
			req.query = {
				limit: '10',
				skip: '20',
				read: 'true',
				type: 'message'
			};

			await notificationController.getNotifications(req as Request, res as Response);

			expect(notificationService.getNotifications).toHaveBeenCalledWith('user123', {
				limit: 10,
				skip: 20,
				read: true,
				type: 'message'
			});
		});
	});

	describe('markAsRead', () => {
		it('should mark notifications as read', async () => {
			req.params = { userId: 'user123' };
			req.body = { notificationIds: ['1', '2'] };

			await notificationController.markAsRead(req as Request, res as Response);

			expect(notificationService.markAsRead).toHaveBeenCalledWith(['1', '2'], 'user123');
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ success: true });
		});

		it('should handle validation errors', async () => {
			req.params = { userId: 'invalid' };
			req.body = { notificationIds: ['invalid'] };

			await notificationController.markAsRead(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.any(Array)
				})
			);
		});
	});

	describe('deleteNotifications', () => {
		it('should delete notifications', async () => {
			req.params = { userId: 'user123' };
			req.body = { notificationIds: ['1', '2'] };

			await notificationController.deleteNotifications(req as Request, res as Response);

			expect(notificationService.deleteNotifications).toHaveBeenCalledWith(['1', '2'], 'user123');
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ success: true });
		});

		it('should handle validation errors', async () => {
			req.params = { userId: 'invalid' };
			req.body = { notificationIds: ['invalid'] };

			await notificationController.deleteNotifications(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: expect.any(Array)
				})
			);
		});
	});

	describe('getUnreadCount', () => {
		it('should get unread notifications count', async () => {
			req.params = { userId: 'user123' };
			const count = 5;

			(notificationService.getUnreadCount as jest.Mock).mockResolvedValue(count);

			await notificationController.getUnreadCount(req as Request, res as Response);

			expect(notificationService.getUnreadCount).toHaveBeenCalledWith('user123');
			expect(res.json).toHaveBeenCalledWith({ count });
		});

		it('should handle service errors', async () => {
			req.params = { userId: 'user123' };

			(notificationService.getUnreadCount as jest.Mock).mockRejectedValue(new Error('Service error'));

			await notificationController.getUnreadCount(req as Request, res as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Nepodařilo se získat počet nepřečtených notifikací' });
		});
	});
});

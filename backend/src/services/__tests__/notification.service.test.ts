import { Notification } from '../../models/notification.model';
import { NotificationService } from '../notification.service';
import { NotificationPreferencesService } from '../notificationPreferences.service';
import { WebSocketService } from '../websocket.service';

jest.mock('../../models/notification.model');
jest.mock('../notificationPreferences.service');
jest.mock('../websocket.service');

describe('NotificationService', () => {
	let service: NotificationService;
	let mockWebSocketService: jest.Mocked<WebSocketService>;
	let mockPreferencesService: jest.Mocked<NotificationPreferencesService>;

	beforeEach(() => {
		mockWebSocketService = new WebSocketService() as jest.Mocked<WebSocketService>;
		mockPreferencesService = new NotificationPreferencesService() as jest.Mocked<NotificationPreferencesService>;
		service = new NotificationService(mockWebSocketService, mockPreferencesService);
		jest.clearAllMocks();
	});

	describe('createNotification', () => {
		it('should create notification when allowed by preferences', async () => {
			const notificationData = {
				userId: '123',
				type: 'message',
				title: 'Test',
				content: 'Test content'
			};

			const mockNotification = {
				...notificationData,
				read: false,
				createdAt: new Date()
			};

			mockPreferencesService.isNotificationAllowed.mockResolvedValue(true);
			(Notification.create as jest.Mock).mockResolvedValue(mockNotification);

			const result = await service.createNotification(notificationData);
			expect(result).toEqual(mockNotification);
			expect(Notification.create).toHaveBeenCalledWith({
				...notificationData,
				read: false
			});
			expect(mockWebSocketService.notifyUser).toHaveBeenCalledWith('123', 'new_notification', mockNotification);
		});

		it('should not create notification when disallowed by preferences', async () => {
			const notificationData = {
				userId: '123',
				type: 'message',
				title: 'Test',
				content: 'Test content'
			};

			mockPreferencesService.isNotificationAllowed.mockResolvedValue(false);

			const result = await service.createNotification(notificationData);
			expect(result).toBeNull();
			expect(Notification.create).not.toHaveBeenCalled();
			expect(mockWebSocketService.notifyUser).not.toHaveBeenCalled();
		});

		it('should throw error on invalid data', async () => {
			const invalidData = {
				userId: '123',
				type: 'invalid',
				title: '',
				content: ''
			};

			await expect(service.createNotification(invalidData as any)).rejects.toThrow();
			expect(Notification.create).not.toHaveBeenCalled();
			expect(mockWebSocketService.notifyUser).not.toHaveBeenCalled();
		});
	});

	// ... zbytek testů zůstává stejný ...
});

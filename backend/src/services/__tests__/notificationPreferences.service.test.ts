import { NotificationPreferences } from '../../models/notificationPreferences.model';
import { NotificationPreferencesService } from '../notificationPreferences.service';

jest.mock('../../models/notificationPreferences.model');

describe('NotificationPreferencesService', () => {
	let service: NotificationPreferencesService;

	beforeEach(() => {
		service = new NotificationPreferencesService();
		jest.clearAllMocks();
	});

	describe('getPreferences', () => {
		it('should return existing preferences', async () => {
			const mockPreferences = {
				userId: '123',
				emailNotifications: true,
				pushNotifications: true,
				inAppNotifications: true,
				notificationTypes: {
					message: true,
					friendRequest: true,
					system: true,
					security: true
				},
				quietHours: {
					enabled: false,
					startTime: '22:00',
					endTime: '08:00'
				}
			};

			(NotificationPreferences.findOne as jest.Mock).mockResolvedValue(mockPreferences);

			const result = await service.getPreferences('123');
			expect(result).toEqual(mockPreferences);
			expect(NotificationPreferences.findOne).toHaveBeenCalledWith({ userId: '123' });
		});

		it('should create default preferences if none exist', async () => {
			(NotificationPreferences.findOne as jest.Mock).mockResolvedValue(null);
			const mockDefaultPreferences = {
				userId: '123',
				emailNotifications: true,
				pushNotifications: true,
				inAppNotifications: true,
				notificationTypes: {
					message: true,
					friendRequest: true,
					system: true,
					security: true
				},
				quietHours: {
					enabled: false,
					startTime: '22:00',
					endTime: '08:00'
				}
			};

			(NotificationPreferences.create as jest.Mock).mockResolvedValue(mockDefaultPreferences);

			const result = await service.getPreferences('123');
			expect(result).toEqual(mockDefaultPreferences);
			expect(NotificationPreferences.create).toHaveBeenCalled();
		});
	});

	describe('updatePreferences', () => {
		it('should update preferences successfully', async () => {
			const updateData = {
				emailNotifications: false,
				notificationTypes: {
					message: false
				}
			};

			const mockUpdatedPreferences = {
				userId: '123',
				...updateData
			};

			(NotificationPreferences.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPreferences);

			const result = await service.updatePreferences('123', updateData);
			expect(result).toEqual(mockUpdatedPreferences);
			expect(NotificationPreferences.findOneAndUpdate).toHaveBeenCalledWith({ userId: '123' }, { $set: updateData }, { new: true, upsert: true });
		});

		it('should throw error on invalid data', async () => {
			const invalidData = {
				emailNotifications: 'invalid'
			};

			await expect(service.updatePreferences('123', invalidData as any)).rejects.toThrow();
		});
	});

	describe('isNotificationAllowed', () => {
		it('should allow notification when preferences are enabled', async () => {
			const mockPreferences = {
				userId: '123',
				notificationTypes: {
					message: true
				},
				quietHours: {
					enabled: false
				}
			};

			(NotificationPreferences.findOne as jest.Mock).mockResolvedValue(mockPreferences);

			const result = await service.isNotificationAllowed('123', 'message');
			expect(result).toBe(true);
		});

		it('should disallow notification when type is disabled', async () => {
			const mockPreferences = {
				userId: '123',
				notificationTypes: {
					message: false
				},
				quietHours: {
					enabled: false
				}
			};

			(NotificationPreferences.findOne as jest.Mock).mockResolvedValue(mockPreferences);

			const result = await service.isNotificationAllowed('123', 'message');
			expect(result).toBe(false);
		});

		it('should disallow notification during quiet hours', async () => {
			const mockPreferences = {
				userId: '123',
				notificationTypes: {
					message: true
				},
				quietHours: {
					enabled: true,
					startTime: '22:00',
					endTime: '08:00'
				}
			};

			(NotificationPreferences.findOne as jest.Mock).mockResolvedValue(mockPreferences);

			// Mock current time to be during quiet hours
			const mockDate = new Date('2024-01-01T23:00:00Z');
			jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

			const result = await service.isNotificationAllowed('123', 'message');
			expect(result).toBe(false);
		});
	});
});

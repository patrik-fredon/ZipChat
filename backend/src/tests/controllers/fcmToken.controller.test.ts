import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FCMTokenController } from '../../controllers/fcmToken.controller';
import { FCMToken } from '../../models/fcmToken.model';

describe('FCMTokenController', () => {
	let controller: FCMTokenController;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		controller = new FCMTokenController();
		mockRequest = {
			user: { id: 'user123' },
			body: {}
		};
		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn()
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('saveToken', () => {
		it('should save new FCM token', async () => {
			// Arrange
			mockRequest.body = {
				token: 'token123',
				deviceId: 'device123',
				platform: 'android'
			};

			// Act
			await controller.saveToken(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token úspěšně uložen' });
		});

		it('should handle invalid token data', async () => {
			// Arrange
			mockRequest.body = {
				token: '',
				deviceId: '',
				platform: 'invalid'
			};

			// Act
			await controller.saveToken(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nepodařilo se uložit token' });
		});
	});

	describe('removeToken', () => {
		it('should remove FCM token', async () => {
			// Arrange
			mockRequest.body = {
				token: 'token123'
			};

			// Act
			await controller.removeToken(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token úspěšně odstraněn' });
		});

		it('should handle missing token', async () => {
			// Arrange
			mockRequest.body = {};

			// Act
			await controller.removeToken(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nepodařilo se odstranit token' });
		});
	});

	describe('getTokens', () => {
		it('should get user FCM tokens', async () => {
			// Arrange
			const mockTokens = [
				{
					userId: 'user123',
					token: 'token123',
					deviceId: 'device123',
					platform: 'android',
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			vi.spyOn(FCMToken, 'find').mockResolvedValue(mockTokens);

			// Act
			await controller.getTokens(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({ tokens: mockTokens });
		});

		it('should handle error when getting tokens', async () => {
			// Arrange
			vi.spyOn(FCMToken, 'find').mockRejectedValue(new Error('Database error'));

			// Act
			await controller.getTokens(mockRequest as Request, mockResponse as Response);

			// Assert
			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Nepodařilo se získat tokeny' });
		});
	});
});

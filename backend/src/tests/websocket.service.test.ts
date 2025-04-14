import { jest } from '@jest/globals';
import { Server } from 'socket.io';
import { Message } from '../models/message.model';
import { WebSocketService } from '../services/websocket.service';
import { verifyToken } from '../utils/auth.utils';

jest.mock('../utils/auth.utils');
jest.mock('../models/message.model');

describe('WebSocketService', () => {
	let webSocketService: WebSocketService;
	let mockIo: Partial<Server>;
	let mockSocket: any;

	beforeEach(() => {
		mockIo = {
			use: jest.fn(),
			on: jest.fn(),
			to: jest.fn().mockReturnThis(),
			emit: jest.fn()
		};

		mockSocket = {
			handshake: {
				auth: {
					token: 'test-token'
				}
			},
			data: {},
			id: 'socket123',
			on: jest.fn()
		};

		webSocketService = new WebSocketService(mockIo as Server);
	});

	describe('setupConnectionHandlers', () => {
		it('should set up authentication middleware', () => {
			expect(mockIo.use).toHaveBeenCalled();
		});

		it('should set up connection handler', () => {
			expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
		});
	});

	describe('authentication', () => {
		it('should authenticate user with valid token', async () => {
			const next = jest.fn();
			const middleware = (mockIo.use as jest.Mock).mock.calls[0][0];

			(verifyToken as jest.Mock).mockResolvedValue({ userId: 'user123' });

			await middleware(mockSocket, next);

			expect(verifyToken).toHaveBeenCalledWith('test-token');
			expect(mockSocket.data.userId).toBe('user123');
			expect(next).toHaveBeenCalled();
		});

		it('should reject connection with invalid token', async () => {
			const next = jest.fn();
			const middleware = (mockIo.use as jest.Mock).mock.calls[0][0];

			(verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

			await middleware(mockSocket, next);

			expect(next).toHaveBeenCalledWith(expect.any(Error));
		});
	});

	describe('notifyUser', () => {
		it('should notify user if connected', () => {
			webSocketService['connectedUsers'].set('user123', 'socket123');

			webSocketService.notifyUser('user123', 'test_event', { data: 'test' });

			expect(mockIo.to).toHaveBeenCalledWith('socket123');
			expect(mockIo.emit).toHaveBeenCalledWith('test_event', { data: 'test' });
		});

		it('should not notify if user is not connected', () => {
			webSocketService.notifyUser('user123', 'test_event', { data: 'test' });

			expect(mockIo.to).not.toHaveBeenCalled();
			expect(mockIo.emit).not.toHaveBeenCalled();
		});
	});

	describe('notifyTyping', () => {
		it('should notify typing status', () => {
			webSocketService['connectedUsers'].set('recipient123', 'socket123');

			webSocketService.notifyTyping('sender123', 'recipient123', true);

			expect(mockIo.to).toHaveBeenCalledWith('socket123');
			expect(mockIo.emit).toHaveBeenCalledWith('typing', {
				senderId: 'sender123',
				isTyping: true
			});
		});
	});

	describe('notifyNewMessage', () => {
		it('should notify new message', () => {
			webSocketService['connectedUsers'].set('recipient123', 'socket123');
			const message = {
				id: 'msg123',
				senderId: 'sender123',
				content: 'Test message'
			};

			webSocketService.notifyNewMessage('recipient123', message as any);

			expect(mockIo.to).toHaveBeenCalledWith('socket123');
			expect(mockIo.emit).toHaveBeenCalledWith('new_message', message);
		});
	});

	describe('notifyMessageStatus', () => {
		it('should notify message status', async () => {
			webSocketService['connectedUsers'].set('sender123', 'socket123');
			const message = {
				id: 'msg123',
				senderId: 'sender123',
				status: 'read'
			};

			(Message.findById as jest.Mock).mockResolvedValue(message);

			await webSocketService.notifyMessageStatus('msg123', 'read');

			expect(Message.findById).toHaveBeenCalledWith('msg123');
			expect(mockIo.to).toHaveBeenCalledWith('socket123');
			expect(mockIo.emit).toHaveBeenCalledWith('message_status', {
				messageId: 'msg123',
				status: 'read'
			});
		});

		it('should not notify if message not found', async () => {
			(Message.findById as jest.Mock).mockResolvedValue(null);

			await webSocketService.notifyMessageStatus('msg123', 'read');

			expect(mockIo.to).not.toHaveBeenCalled();
			expect(mockIo.emit).not.toHaveBeenCalled();
		});
	});
});

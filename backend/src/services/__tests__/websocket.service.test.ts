import { Server, WebSocket } from 'ws';
import { verifyToken } from '../../utils/auth';
import { WebSocketService } from '../websocket.service';

jest.mock('../../utils/auth');
jest.mock('ws');

describe('WebSocketService', () => {
	let service: WebSocketService;
	let mockServer: jest.Mocked<Server>;
	let mockWebSocket: jest.Mocked<WebSocket>;

	beforeEach(() => {
		mockServer = new Server() as jest.Mocked<Server>;
		mockWebSocket = new WebSocket('ws://localhost') as jest.Mocked<WebSocket>;
		service = new WebSocketService(mockServer);
		jest.clearAllMocks();
	});

	describe('connection handling', () => {
		it('should accept connection with valid token', async () => {
			const mockDecoded = { userId: '123' };
			(verifyToken as jest.Mock).mockResolvedValue(mockDecoded);
			mockWebSocket.readyState = WebSocket.OPEN;

			const mockReq = { url: 'ws://localhost?token=valid' };
			mockServer.emit('connection', mockWebSocket, mockReq);

			await new Promise(process.nextTick);

			expect(verifyToken).toHaveBeenCalledWith('valid');
			expect(mockWebSocket.send).toHaveBeenCalledWith(
				JSON.stringify({
					event: 'connection_established',
					data: { status: 'connected' }
				})
			);
		});

		it('should reject connection without token', async () => {
			const mockReq = { url: 'ws://localhost' };
			mockServer.emit('connection', mockWebSocket, mockReq);

			await new Promise(process.nextTick);

			expect(mockWebSocket.close).toHaveBeenCalledWith(1008, 'Unauthorized');
		});

		it('should handle connection error', async () => {
			const mockReq = { url: 'ws://localhost?token=invalid' };
			(verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));
			mockServer.emit('connection', mockWebSocket, mockReq);

			await new Promise(process.nextTick);

			expect(mockWebSocket.close).toHaveBeenCalledWith(1008, 'Unauthorized');
		});
	});

	describe('notifyUser', () => {
		it('should send message to connected user', () => {
			const userId = '123';
			const event = 'test_event';
			const data = { test: 'data' };

			service['clients'].set(userId, { socket: mockWebSocket, userId });
			mockWebSocket.readyState = WebSocket.OPEN;

			service.notifyUser(userId, event, data);

			expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify({ event, data }));
		});

		it('should not send message to disconnected user', () => {
			const userId = '123';
			const event = 'test_event';
			const data = { test: 'data' };

			service['clients'].set(userId, { socket: mockWebSocket, userId });
			mockWebSocket.readyState = WebSocket.CLOSED;

			service.notifyUser(userId, event, data);

			expect(mockWebSocket.send).not.toHaveBeenCalled();
		});
	});

	describe('broadcast', () => {
		it('should send message to all connected users except excluded', () => {
			const event = 'test_event';
			const data = { test: 'data' };
			const excludedUserId = '123';

			const mockWebSocket1 = new WebSocket('ws://localhost') as jest.Mocked<WebSocket>;
			const mockWebSocket2 = new WebSocket('ws://localhost') as jest.Mocked<WebSocket>;

			mockWebSocket1.readyState = WebSocket.OPEN;
			mockWebSocket2.readyState = WebSocket.OPEN;

			service['clients'].set('123', { socket: mockWebSocket1, userId: '123' });
			service['clients'].set('456', { socket: mockWebSocket2, userId: '456' });

			service.broadcast(event, data, excludedUserId);

			expect(mockWebSocket1.send).not.toHaveBeenCalled();
			expect(mockWebSocket2.send).toHaveBeenCalledWith(JSON.stringify({ event, data }));
		});
	});

	describe('isUserConnected', () => {
		it('should return true for connected user', () => {
			const userId = '123';
			service['clients'].set(userId, { socket: mockWebSocket, userId });

			expect(service.isUserConnected(userId)).toBe(true);
		});

		it('should return false for disconnected user', () => {
			expect(service.isUserConnected('123')).toBe(false);
		});
	});

	describe('ping/pong handling', () => {
		it('should remove disconnected clients', () => {
			const userId = '123';
			service['clients'].set(userId, { socket: mockWebSocket, userId });
			mockWebSocket.isAlive = false;

			service['pingClients']();

			expect(service['clients'].has(userId)).toBe(false);
			expect(mockWebSocket.terminate).toHaveBeenCalled();
		});

		it('should mark client as alive on pong', () => {
			const userId = '123';
			service['clients'].set(userId, { socket: mockWebSocket, userId });
			mockWebSocket.isAlive = false;

			service['handlePong'](userId);

			expect(mockWebSocket.isAlive).toBe(true);
		});
	});
});

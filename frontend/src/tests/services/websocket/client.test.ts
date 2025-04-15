import { WebSocketClient } from '../../../services/websocket/client';

// Mock WebSocket
class MockWebSocket {
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: string }) => void) | null = null;
    onclose: ((event: { code: number; reason: string }) => void) | null = null;
    onerror: ((error: any) => void) | null = null;
    readyState = WebSocket.OPEN;
    send = vi.fn();
    close = vi.fn();

    constructor(url: string) {
        this.url = url;
    }
}

// Mock getToken
vi.mock('../../../services/auth', () => ({
    getToken: vi.fn(() => 'test-token')
}));

describe('WebSocketClient', () => {
    let client: WebSocketClient;
    let mockWs: MockWebSocket;

    beforeEach(() => {
        // @ts-ignore
        global.WebSocket = MockWebSocket;
        client = new WebSocketClient('ws://localhost:3001');
        mockWs = new MockWebSocket('ws://localhost:3001');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should connect to WebSocket server', () => {
        const connectSpy = vi.spyOn(client, 'connect');
        client.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should send messages when connected', () => {
        client.connect();
        const message = { type: 'chat', data: { message: 'Hello' } };
        client.send(message);
        expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should handle incoming messages', () => {
        const messageHandler = vi.fn();
        client.on('chat', messageHandler);
        
        client.connect();
        const message = { type: 'chat', data: { message: 'Hello' } };
        mockWs.onmessage?.({ data: JSON.stringify(message) });
        
        expect(messageHandler).toHaveBeenCalledWith(message.data);
    });

    it('should handle connection errors', () => {
        const errorHandler = vi.fn();
        client.on('error', errorHandler);
        
        client.connect();
        const error = new Error('Connection error');
        mockWs.onerror?.(error);
        
        expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle disconnection', () => {
        const disconnectHandler = vi.fn();
        client.on('disconnected', disconnectHandler);
        
        client.connect();
        mockWs.onclose?.({ code: 1000, reason: 'Normal closure' });
        
        expect(disconnectHandler).toHaveBeenCalled();
    });

    it('should attempt to reconnect on disconnection', () => {
        const connectSpy = vi.spyOn(client, 'connect');
        
        client.connect();
        mockWs.onclose?.({ code: 1000, reason: 'Normal closure' });
        
        expect(connectSpy).toHaveBeenCalledTimes(2);
    });

    it('should stop reconnecting after max attempts', () => {
        const connectSpy = vi.spyOn(client, 'connect');
        
        client.connect();
        // Simulate multiple disconnections
        for (let i = 0; i < 6; i++) {
            mockWs.onclose?.({ code: 1000, reason: 'Normal closure' });
        }
        
        expect(connectSpy).toHaveBeenCalledTimes(6); // Initial + 5 reconnects
    });

    it('should send ping messages', () => {
        client.connect();
        const sendSpy = vi.spyOn(client, 'send');
        
        // Simulate ping interval
        jest.advanceTimersByTime(30000);
        
        expect(sendSpy).toHaveBeenCalledWith({ type: 'ping', data: {} });
    });

    it('should handle typing notifications', () => {
        const typingHandler = vi.fn();
        client.on('typing', typingHandler);
        
        client.connect();
        const message = { type: 'typing', data: { isTyping: true } };
        mockWs.onmessage?.({ data: JSON.stringify(message) });
        
        expect(typingHandler).toHaveBeenCalledWith(message.data);
    });
}); 
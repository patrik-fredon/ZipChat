import { EventEmitter } from 'events';
import { getToken } from '../auth';

interface WebSocketMessage {
    type: string;
    data: any;
}

export class WebSocketClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 1000;
    private pingInterval: NodeJS.Timeout | null = null;
    private readonly pingIntervalMs = 30000;

    constructor(private url: string) {
        super();
    }

    public connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        const token = getToken();
        if (!token) {
            console.error('No authentication token available');
            return;
        }

        this.ws = new WebSocket(`${this.url}?token=${token}`);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.startPingInterval();
            this.emit('connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.stopPingInterval();
            this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        };
    }

    private handleMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'chat':
                this.emit('chat', message.data);
                break;
            case 'typing':
                this.emit('typing', message.data);
                break;
            case 'pong':
                // Handle pong response
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    private handleDisconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                this.connect();
            }, this.reconnectTimeout * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('disconnected');
        }
    }

    private startPingInterval(): void {
        this.pingInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.send({ type: 'ping', data: {} });
            }
        }, this.pingIntervalMs);
    }

    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    public send(message: WebSocketMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.stopPingInterval();
            this.ws.close();
            this.ws = null;
        }
    }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient(import.meta.env.VITE_WS_URL || 'ws://localhost:3001'); 
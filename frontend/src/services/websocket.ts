import { Message } from '../types/message';

class WebSocketService {
	private socket: WebSocket | null = null;
	private messageHandlers: ((message: Message) => void)[] = [];

	connect(userId: string): void {
		if (this.socket) {
			this.disconnect();
		}

		const wsUrl = `${process.env.REACT_APP_WS_URL}/messages?userId=${userId}`;
		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = () => {
			console.log('WebSocket connected');
		};

		this.socket.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as Message;
				this.messageHandlers.forEach((handler) => handler(message));
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		this.socket.onclose = () => {
			console.log('WebSocket disconnected');
			// Attempt to reconnect after 5 seconds
			setTimeout(() => this.connect(userId), 5000);
		};
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}

	onMessage(handler: (message: Message) => void): void {
		this.messageHandlers.push(handler);
	}

	removeMessageHandler(handler: (message: Message) => void): void {
		this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
	}
}

export const websocketService = new WebSocketService();

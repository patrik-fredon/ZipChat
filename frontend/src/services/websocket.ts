import { EventEmitter } from 'events';

export interface WebSocketMessage {
	type: string;
	payload: any;
}

export class WebSocketService {
	private static instance: WebSocketService;
	private ws: WebSocket | null = null;
	private eventEmitter: EventEmitter;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout = 1000;

	private constructor() {
		this.eventEmitter = new EventEmitter();
	}

	public static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	public connect(url: string): void {
		if (this.ws) {
			this.ws.close();
		}

		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			console.log('WebSocket připojeno');
			this.reconnectAttempts = 0;
			this.eventEmitter.emit('connected');
		};

		this.ws.onmessage = (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				this.eventEmitter.emit('message', message);
			} catch (error) {
				console.error('Chyba při zpracování zprávy:', error);
			}
		};

		this.ws.onclose = () => {
			console.log('WebSocket odpojeno');
			this.eventEmitter.emit('disconnected');
			this.handleReconnect(url);
		};

		this.ws.onerror = (error) => {
			console.error('WebSocket chyba:', error);
			this.eventEmitter.emit('error', error);
		};
	}

	private handleReconnect(url: string): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(`Pokus o opětovné připojení (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
			setTimeout(() => this.connect(url), this.reconnectTimeout * this.reconnectAttempts);
		} else {
			console.error('Maximální počet pokusů o opětovné připojení dosažen');
			this.eventEmitter.emit('reconnectFailed');
		}
	}

	public send(message: WebSocketMessage): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(message));
		} else {
			console.error('WebSocket není připojeno');
			this.eventEmitter.emit('error', new Error('WebSocket není připojeno'));
		}
	}

	public on(event: string, listener: (...args: any[]) => void): void {
		this.eventEmitter.on(event, listener);
	}

	public off(event: string, listener: (...args: any[]) => void): void {
		this.eventEmitter.off(event, listener);
	}

	public disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}

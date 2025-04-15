import { Message } from '../types';

interface WebSocketConfig {
	url: string;
	onMessage: (message: Message) => void;
	onError: (error: Error) => void;
	onClose: () => void;
}

export class WebSocketService {
	private static instance: WebSocketService;
	private socket: WebSocket | null = null;
	private config: WebSocketConfig | null = null;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectTimeout = 1000;

	private constructor() {}

	public static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	public connect(config: WebSocketConfig): void {
		this.config = config;
		this.socket = new WebSocket(config.url);

		this.socket.onopen = () => {
			console.log('WebSocket připojeno');
			this.reconnectAttempts = 0;
		};

		this.socket.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as Message;
				config.onMessage(message);
			} catch (error) {
				console.error('Chyba při zpracování zprávy:', error);
			}
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket chyba:', error);
			config.onError(new Error('Chyba WebSocket připojení'));
		};

		this.socket.onclose = () => {
			console.log('WebSocket odpojeno');
			this.reconnect();
			config.onClose();
		};
	}

	public disconnect(): void {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}
	}

	public sendMessage(message: Message): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket není připojeno');
		}
	}

	private reconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts && this.config) {
			this.reconnectAttempts++;
			console.log(`Pokus o opětovné připojení (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
			
			setTimeout(() => {
				this.connect(this.config!);
			}, this.reconnectTimeout * this.reconnectAttempts);
		} else {
			console.error('Maximální počet pokusů o opětovné připojení dosažen');
		}
	}
}

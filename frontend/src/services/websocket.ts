import { Message } from '../types';
import { EncryptionService } from './encryption.service';

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
	private encryptionService: EncryptionService;

	private constructor() {
		this.encryptionService = new EncryptionService();
	}

	public static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	public async connect(config: WebSocketConfig): Promise<void> {
		this.config = config;
		this.socket = new WebSocket(config.url);

		this.socket.onopen = () => {
			console.log('WebSocket připojeno');
			this.reconnectAttempts = 0;
		};

		this.socket.onmessage = async (event) => {
			try {
				const encryptedMessage = JSON.parse(event.data);
				const decryptedMessage = await this.encryptionService.decryptMessage(encryptedMessage);
				config.onMessage(decryptedMessage);
			} catch (error) {
				console.error('Chyba při zpracování zprávy:', error);
				config.onError(new Error('Chyba při zpracování zprávy'));
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

	public async sendMessage(message: Message): Promise<void> {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			try {
				const encryptedMessage = await this.encryptionService.encryptMessage(message);
				this.socket.send(JSON.stringify(encryptedMessage));
			} catch (error) {
				console.error('Chyba při šifrování zprávy:', error);
				throw new Error('Chyba při odesílání zprávy');
			}
		} else {
			throw new Error('WebSocket není připojeno');
		}
	}

	private reconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts && this.config) {
			this.reconnectAttempts++;
			console.log(`Pokus o opětovné připojení (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
			
			setTimeout(() => {
				this.connect(this.config!);
			}, this.reconnectTimeout * Math.pow(2, this.reconnectAttempts));
		} else {
			console.error('Maximální počet pokusů o opětovné připojení dosažen');
		}
	}
}

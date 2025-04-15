import { Server, WebSocket } from 'ws';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';
import { EncryptionService } from './encryption.service';

interface WebSocketClient {
	socket: WebSocket;
	userId: string;
}

export class WebSocketService {
	private clients: Map<string, WebSocketClient> = new Map();
	private server: Server;
	private encryptionService: EncryptionService;

	constructor(server: Server) {
		this.server = server;
		this.encryptionService = new EncryptionService();
		this.setupWebSocketServer();
	}

	private setupWebSocketServer() {
		this.server.on('connection', async (ws: WebSocket, req) => {
			try {
				const token = req.url?.split('token=')[1];
				if (!token) {
					ws.close(1008, 'Unauthorized');
					return;
				}

				const decoded = await verifyToken(token);
				const userId = decoded.userId;

				// Uložení klienta
				this.clients.set(userId, { socket: ws, userId });

				// Nastavení handlerů
				ws.on('close', () => this.handleDisconnect(userId));
				ws.on('error', (error) => this.handleError(userId, error));
				ws.on('pong', () => this.handlePong(userId));
				ws.on('message', async (data) => {
					try {
						const encryptedMessage = JSON.parse(data.toString());
						const decryptedMessage = await this.encryptionService.decryptMessage(encryptedMessage);
						this.handleMessage(userId, decryptedMessage);
					} catch (error) {
						logger.error('Chyba při zpracování zprávy:', error);
						ws.send(JSON.stringify({ error: 'Chyba při zpracování zprávy' }));
					}
				});

				// Odeslání potvrzení připojení
				await this.notifyUser(userId, 'connection_established', { status: 'connected' });

				logger.info(`WebSocket připojení navázáno pro uživatele ${userId}`);
			} catch (error) {
				logger.error('Chyba při zpracování WebSocket připojení:', error);
				ws.close(1008, 'Unauthorized');
			}
		});

		// Pravidelné pingy pro udržení spojení
		setInterval(() => this.pingClients(), 30000);
	}

	private handleDisconnect(userId: string) {
		this.clients.delete(userId);
		logger.info(`Uživatel ${userId} odpojen`);
	}

	private handleError(userId: string, error: Error) {
		logger.error(`Chyba WebSocket pro uživatele ${userId}:`, error);
		this.clients.delete(userId);
	}

	private handlePong(userId: string) {
		const client = this.clients.get(userId);
		if (client) {
			client.socket.isAlive = true;
		}
	}

	private async handleMessage(userId: string, message: any) {
		// Zde implementujte logiku zpracování zpráv
		logger.info(`Přijata zpráva od uživatele ${userId}:`, message);
	}

	private pingClients() {
		this.clients.forEach((client) => {
			if (client.socket.isAlive === false) {
				client.socket.terminate();
				this.clients.delete(client.userId);
				return;
			}

			client.socket.isAlive = false;
			client.socket.ping();
		});
	}

	public async notifyUser(userId: string, event: string, data: any) {
		const client = this.clients.get(userId);
		if (client && client.socket.readyState === WebSocket.OPEN) {
			try {
				const encryptedMessage = await this.encryptionService.encryptMessage({ event, data });
				client.socket.send(JSON.stringify(encryptedMessage));
			} catch (error) {
				logger.error('Chyba při šifrování zprávy:', error);
			}
		}
	}

	public async broadcast(event: string, data: any, excludeUserId?: string) {
		for (const [userId, client] of this.clients.entries()) {
			if (userId !== excludeUserId && client.socket.readyState === WebSocket.OPEN) {
				try {
					const encryptedMessage = await this.encryptionService.encryptMessage({ event, data });
					client.socket.send(JSON.stringify(encryptedMessage));
				} catch (error) {
					logger.error(`Chyba při broadcastu zprávy uživateli ${userId}:`, error);
				}
			}
		}
	}

	public isUserConnected(userId: string): boolean {
		return this.clients.has(userId);
	}
}

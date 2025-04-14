import { Server, WebSocket } from 'ws';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';

interface WebSocketClient {
	socket: WebSocket;
	userId: string;
}

export class WebSocketService {
	private clients: Map<string, WebSocketClient> = new Map();
	private server: Server;

	constructor(server: Server) {
		this.server = server;
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

				// Odeslání potvrzení připojení
				this.notifyUser(userId, 'connection_established', { status: 'connected' });

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
		logger.info(`WebSocket připojení ukončeno pro uživatele ${userId}`);
	}

	private handleError(userId: string, error: Error) {
		logger.error(`WebSocket chyba pro uživatele ${userId}:`, error);
		this.clients.delete(userId);
	}

	private handlePong(userId: string) {
		const client = this.clients.get(userId);
		if (client) {
			client.socket.isAlive = true;
		}
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

	public notifyUser(userId: string, event: string, data: any) {
		const client = this.clients.get(userId);
		if (client && client.socket.readyState === WebSocket.OPEN) {
			client.socket.send(JSON.stringify({ event, data }));
		}
	}

	public broadcast(event: string, data: any, excludeUserId?: string) {
		this.clients.forEach((client) => {
			if (client.userId !== excludeUserId && client.socket.readyState === WebSocket.OPEN) {
				client.socket.send(JSON.stringify({ event, data }));
			}
		});
	}

	public isUserConnected(userId: string): boolean {
		return this.clients.has(userId);
	}
}

import { Server } from 'socket.io';
import { Message } from '../models/message.model';
import { IMessage } from '../types/message.types';
import { verifyToken } from '../utils/auth.utils';

export class WebSocketService {
	private io: Server;
	private connectedUsers: Map<string, string> = new Map();

	constructor(io: Server) {
		this.io = io;
		this.setupConnectionHandlers();
	}

	private setupConnectionHandlers() {
		this.io.use(async (socket, next) => {
			try {
				const token = socket.handshake.auth.token;
				if (!token) {
					return next(new Error('Authentication error'));
				}

				const decoded = await verifyToken(token);
				socket.data.userId = decoded.userId;
				next();
			} catch (error) {
				next(new Error('Authentication error'));
			}
		});

		this.io.on('connection', (socket) => {
			const userId = socket.data.userId;
			this.connectedUsers.set(userId, socket.id);

			socket.on('disconnect', () => {
				this.connectedUsers.delete(userId);
			});
		});
	}

	notifyUser(userId: string, event: string, data: any) {
		const socketId = this.connectedUsers.get(userId);
		if (socketId) {
			this.io.to(socketId).emit(event, data);
		}
	}

	notifyTyping(senderId: string, recipientId: string, isTyping: boolean) {
		this.notifyUser(recipientId, 'typing', {
			senderId,
			isTyping
		});
	}

	notifyNewMessage(recipientId: string, message: IMessage) {
		this.notifyUser(recipientId, 'new_message', message);
	}

	notifyMessageStatus(messageId: string, status: 'delivered' | 'read') {
		const message = Message.findById(messageId);
		if (message) {
			this.notifyUser(message.senderId, 'message_status', {
				messageId,
				status
			});
		}
	}
}

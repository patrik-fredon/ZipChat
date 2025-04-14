import { z } from 'zod';
import { IMessage, Message } from '../models/message.model';
import { User } from '../models/user.model';
import { IMessage as IMessageType } from '../types/message.types';
import { EncryptionService } from './encryption.service';
import { WebSocketService } from './websocket.service';

export class MessageService {
	constructor(private encryptionService: EncryptionService, private webSocketService: WebSocketService) {}

	/**
	 * Sends a new message
	 * @param senderId The ID of the sender
	 * @param recipientId The ID of the recipient
	 * @param content The message content
	 * @returns The created message
	 */
	public static async sendMessage(senderId: string, recipientId: string, content: string): Promise<IMessage> {
		// Validate input
		const schema = z.object({
			senderId: z.string().uuid(),
			recipientId: z.string().uuid(),
			content: z.string().min(1)
		});
		schema.parse({ senderId, recipientId, content });

		// Verify users exist
		const [sender, recipient] = await Promise.all([User.findById(senderId), User.findById(recipientId)]);
		if (!sender || !recipient) {
			throw new Error('Invalid sender or recipient');
		}

		// Encrypt message
		const { encryptedData, iv, authTag, keyId } = await EncryptionService.encryptMessage(content, recipientId, senderId);

		// Create message record
		const message = await Message.create({
			senderId,
			recipientId,
			content: encryptedData,
			iv,
			authTag,
			keyId,
			status: 'sent',
			timestamp: new Date()
		});

		// Notify recipient via WebSocket
		await WebSocketService.notifyNewMessage(recipientId, {
			id: message.id,
			senderId,
			timestamp: message.timestamp
		});

		return message;
	}

	/**
	 * Retrieves messages for a conversation
	 * @param userId The ID of the requesting user
	 * @param otherUserId The ID of the other participant
	 * @param limit Maximum number of messages to retrieve
	 * @param before Timestamp to get messages before
	 * @returns Array of messages
	 */
	public static async getMessages(userId: string, otherUserId: string, limit: number = 50, before?: Date): Promise<IMessage[]> {
		// Validate input
		const schema = z.object({
			userId: z.string().uuid(),
			otherUserId: z.string().uuid(),
			limit: z.number().min(1).max(100),
			before: z.date().optional()
		});
		schema.parse({ userId, otherUserId, limit, before });

		// Get messages
		const messages = await Message.find({
			$or: [
				{ senderId: userId, recipientId: otherUserId },
				{ senderId: otherUserId, recipientId: userId }
			],
			...(before && { timestamp: { $lt: before } })
		})
			.sort({ timestamp: -1 })
			.limit(limit);

		// Decrypt messages where user is recipient
		const decryptedMessages = await Promise.all(
			messages.map(async (msg) => {
				if (msg.recipientId === userId) {
					const decryptedContent = await EncryptionService.decryptMessage(msg.content, msg.iv, msg.authTag, msg.keyId, userId);
					return { ...msg, content: decryptedContent };
				}
				return msg;
			})
		);

		return decryptedMessages;
	}

	/**
	 * Marks messages as read
	 * @param userId The ID of the user marking messages as read
	 * @param messageIds Array of message IDs to mark as read
	 */
	public static async markMessagesAsRead(userId: string, messageIds: string[]): Promise<void> {
		// Validate input
		const schema = z.object({
			userId: z.string().uuid(),
			messageIds: z.array(z.string().uuid()).min(1)
		});
		schema.parse({ userId, messageIds });

		// Update message status
		await Message.updateMany(
			{
				_id: { $in: messageIds },
				recipientId: userId,
				status: { $ne: 'read' }
			},
			{
				$set: { status: 'read', readAt: new Date() }
			}
		);

		// Notify senders via WebSocket
		const messages = await Message.find({
			_id: { $in: messageIds },
			recipientId: userId
		});

		const notifications = messages.reduce((acc, msg) => {
			if (!acc[msg.senderId]) {
				acc[msg.senderId] = [];
			}
			acc[msg.senderId].push(msg.id);
			return acc;
		}, {} as Record<string, string[]>);

		await Promise.all(Object.entries(notifications).map(([senderId, ids]) => WebSocketService.notifyMessagesRead(senderId, ids)));
	}

	async sendMessage(messageData: IMessageType) {
		const { senderId, recipientId, content, expiresAt, attachments } = messageData;

		// Encrypt message content
		const encryptedContent = await this.encryptionService.encryptMessage(content);

		// Create message
		const message = await Message.create({
			senderId,
			recipientId,
			content: encryptedContent,
			expiresAt,
			attachments,
			status: 'sent'
		});

		// Notify recipient via WebSocket
		this.webSocketService.notifyUser(recipientId, 'new_message', message);

		return message;
	}

	async saveDraft(userId: string, recipientId: string, content: string) {
		// Encrypt draft content
		const encryptedContent = await this.encryptionService.encryptMessage(content);

		// Save draft
		await Message.findOneAndUpdate({ senderId: userId, recipientId, status: 'draft' }, { content: encryptedContent }, { upsert: true, new: true });
	}

	async getDraft(userId: string, recipientId: string) {
		const draft = await Message.findOne({
			senderId: userId,
			recipientId,
			status: 'draft'
		});

		if (!draft) return null;

		// Decrypt draft content
		const decryptedContent = await this.encryptionService.decryptMessage(draft.content);

		return {
			...draft.toObject(),
			content: decryptedContent
		};
	}

	async handleTyping(senderId: string, recipientId: string, isTyping: boolean) {
		this.webSocketService.notifyUser(recipientId, 'typing', {
			senderId,
			isTyping
		});
	}

	async cleanupExpiredMessages() {
		const expiredMessages = await Message.find({
			expiresAt: { $lt: new Date() }
		});

		for (const message of expiredMessages) {
			// Delete attachments
			if (message.attachments) {
				for (const attachment of message.attachments) {
					// Delete file from storage
					// TODO: Implement file deletion
				}
			}

			// Delete message
			await message.deleteOne();
		}
	}
}

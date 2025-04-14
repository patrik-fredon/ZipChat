import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/user.model';
import { EncryptionService } from '../services/encryption.service';
import { MessageService } from '../services/message.service';
import { WebSocketService } from '../services/websocket.service';

const messageSchema = z.object({
	senderId: z.string(),
	recipientId: z.string(),
	content: z.string().min(1).max(1000),
	expiresAt: z.string().optional()
});

export class MessageController {
	constructor(private messageService: MessageService, private webSocketService: WebSocketService) {}

	/**
	 * Encrypts a message and stores it
	 * @param req Express request object
	 * @param res Express response object
	 */
	public static async encryptMessage(req: Request, res: Response): Promise<void> {
		try {
			// Validate request body
			const schema = z.object({
				message: z.string().min(1),
				recipientId: z.string().uuid()
			});
			const { message, recipientId } = schema.parse(req.body);

			// Get sender from authenticated user
			const senderId = req.user.id;

			// Check if recipient exists
			const recipient = await User.findById(recipientId);
			if (!recipient) {
				res.status(404).json({ error: 'Recipient not found' });
				return;
			}

			// Encrypt message
			const encrypted = await EncryptionService.encryptMessage(message, recipientId, senderId);

			// TODO: Store encrypted message in database
			// const storedMessage = await Message.create({
			//     senderId,
			//     recipientId,
			//     ...encrypted
			// });

			res.status(200).json({
				success: true,
				data: encrypted
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					error: 'Validation error',
					details: error.errors
				});
			} else {
				res.status(500).json({
					error: 'Internal server error',
					message: error.message
				});
			}
		}
	}

	/**
	 * Decrypts a message
	 * @param req Express request object
	 * @param res Express response object
	 */
	public static async decryptMessage(req: Request, res: Response): Promise<void> {
		try {
			// Validate request body
			const schema = z.object({
				encryptedData: z.string().min(1),
				iv: z.string().min(1),
				authTag: z.string().min(1),
				keyId: z.string().uuid()
			});
			const { encryptedData, iv, authTag, keyId } = schema.parse(req.body);

			// Get recipient from authenticated user
			const recipientId = req.user.id;

			// Decrypt message
			const decrypted = await EncryptionService.decryptMessage(encryptedData, iv, authTag, keyId, recipientId);

			res.status(200).json({
				success: true,
				data: { message: decrypted }
			});
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					error: 'Validation error',
					details: error.errors
				});
			} else {
				res.status(500).json({
					error: 'Internal server error',
					message: error.message
				});
			}
		}
	}

	/**
	 * Rotates encryption keys for the authenticated user
	 * @param req Express request object
	 * @param res Express response object
	 */
	public static async rotateKeys(req: Request, res: Response): Promise<void> {
		try {
			const userId = req.user.id;
			const newKey = await EncryptionService.rotateKeys(userId);

			res.status(200).json({
				success: true,
				data: {
					keyId: newKey.id,
					publicKey: newKey.publicKey
				}
			});
		} catch (error) {
			res.status(500).json({
				error: 'Internal server error',
				message: error.message
			});
		}
	}

	async sendMessage(req: Request, res: Response) {
		try {
			const { senderId, recipientId, content, expiresAt } = messageSchema.parse(req.body);
			const attachments = req.files as Express.Multer.File[];

			const message = await this.messageService.sendMessage({
				senderId,
				recipientId,
				content,
				expiresAt: expiresAt ? new Date(expiresAt) : undefined,
				attachments: attachments?.map((file) => ({
					filename: file.filename,
					originalname: file.originalname,
					mimetype: file.mimetype,
					size: file.size,
					path: file.path
				}))
			});

			// Notify recipient via WebSocket
			this.webSocketService.notifyUser(recipientId, 'new_message', message);

			res.status(201).json(message);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({ error: error.errors });
			}
			res.status(500).json({ error: 'Nepodařilo se odeslat zprávu' });
		}
	}

	async handleTyping(req: Request, res: Response) {
		try {
			const { senderId, recipientId, isTyping = true } = req.body;

			// Notify recipient via WebSocket
			this.webSocketService.notifyUser(recipientId, 'typing', {
				senderId,
				isTyping
			});

			res.status(200).json({ success: true });
		} catch (error) {
			res.status(500).json({ error: 'Nepodařilo se zpracovat indikátor psaní' });
		}
	}

	async saveDraft(req: Request, res: Response) {
		try {
			const { userId, recipientId, content } = req.body;

			await this.messageService.saveDraft(userId, recipientId, content);

			res.status(200).json({ success: true });
		} catch (error) {
			res.status(500).json({ error: 'Nepodařilo se uložit koncept' });
		}
	}

	async getDraft(req: Request, res: Response) {
		try {
			const { userId, recipientId } = req.params;

			const draft = await this.messageService.getDraft(userId, recipientId);

			res.status(200).json(draft);
		} catch (error) {
			res.status(500).json({ error: 'Nepodařilo se načíst koncept' });
		}
	}
}

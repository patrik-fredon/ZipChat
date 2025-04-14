import { jest } from '@jest/globals';
import { Message } from '../models/message.model';
import { EncryptionService } from '../services/encryption.service';
import { MessageService } from '../services/message.service';
import { WebSocketService } from '../services/websocket.service';

jest.mock('../models/message.model');
jest.mock('../services/encryption.service');
jest.mock('../services/websocket.service');

describe('MessageService', () => {
	let messageService: MessageService;
	let encryptionService: EncryptionService;
	let webSocketService: WebSocketService;

	beforeEach(() => {
		encryptionService = new EncryptionService();
		webSocketService = new WebSocketService({} as any);
		messageService = new MessageService(encryptionService, webSocketService);
	});

	describe('sendMessage', () => {
		it('should send a message successfully', async () => {
			const messageData = {
				senderId: 'sender123',
				recipientId: 'recipient123',
				content: 'Test message',
				expiresAt: new Date(),
				attachments: []
			};

			const encryptedContent = 'encrypted-content';
			const createdMessage = {
				...messageData,
				content: encryptedContent,
				status: 'sent'
			};

			(encryptionService.encryptMessage as jest.Mock).mockResolvedValue(encryptedContent);
			(Message.create as jest.Mock).mockResolvedValue(createdMessage);

			const result = await messageService.sendMessage(messageData);

			expect(encryptionService.encryptMessage).toHaveBeenCalledWith(messageData.content);
			expect(Message.create).toHaveBeenCalledWith({
				...messageData,
				content: encryptedContent,
				status: 'sent'
			});
			expect(webSocketService.notifyUser).toHaveBeenCalledWith(messageData.recipientId, 'new_message', createdMessage);
			expect(result).toEqual(createdMessage);
		});

		it('should handle errors during message sending', async () => {
			const messageData = {
				senderId: 'sender123',
				recipientId: 'recipient123',
				content: 'Test message',
				expiresAt: new Date(),
				attachments: []
			};

			(encryptionService.encryptMessage as jest.Mock).mockRejectedValue(new Error('Encryption failed'));

			await expect(messageService.sendMessage(messageData)).rejects.toThrow('Encryption failed');
		});
	});

	describe('saveDraft', () => {
		it('should save a draft message successfully', async () => {
			const userId = 'user123';
			const recipientId = 'recipient123';
			const content = 'Draft message';

			const encryptedContent = 'encrypted-draft';
			(encryptionService.encryptMessage as jest.Mock).mockResolvedValue(encryptedContent);

			await messageService.saveDraft(userId, recipientId, content);

			expect(encryptionService.encryptMessage).toHaveBeenCalledWith(content);
			expect(Message.findOneAndUpdate).toHaveBeenCalledWith({ senderId: userId, recipientId, status: 'draft' }, { content: encryptedContent }, { upsert: true, new: true });
		});
	});

	describe('getDraft', () => {
		it('should retrieve and decrypt a draft message', async () => {
			const userId = 'user123';
			const recipientId = 'recipient123';
			const encryptedContent = 'encrypted-draft';
			const decryptedContent = 'Draft message';

			const draft = {
				toObject: () => ({
					content: encryptedContent,
					senderId: userId,
					recipientId
				})
			};

			(Message.findOne as jest.Mock).mockResolvedValue(draft);
			(encryptionService.decryptMessage as jest.Mock).mockResolvedValue(decryptedContent);

			const result = await messageService.getDraft(userId, recipientId);

			expect(Message.findOne).toHaveBeenCalledWith({
				senderId: userId,
				recipientId,
				status: 'draft'
			});
			expect(encryptionService.decryptMessage).toHaveBeenCalledWith(encryptedContent);
			expect(result).toEqual({
				content: decryptedContent,
				senderId: userId,
				recipientId
			});
		});

		it('should return null if no draft exists', async () => {
			const userId = 'user123';
			const recipientId = 'recipient123';

			(Message.findOne as jest.Mock).mockResolvedValue(null);

			const result = await messageService.getDraft(userId, recipientId);

			expect(result).toBeNull();
		});
	});

	describe('handleTyping', () => {
		it('should notify recipient about typing status', async () => {
			const senderId = 'sender123';
			const recipientId = 'recipient123';
			const isTyping = true;

			await messageService.handleTyping(senderId, recipientId, isTyping);

			expect(webSocketService.notifyUser).toHaveBeenCalledWith(recipientId, 'typing', { senderId, isTyping });
		});
	});

	describe('cleanupExpiredMessages', () => {
		it('should delete expired messages and their attachments', async () => {
			const expiredMessages = [
				{
					attachments: [{ path: 'path1' }, { path: 'path2' }],
					deleteOne: jest.fn()
				},
				{
					attachments: [],
					deleteOne: jest.fn()
				}
			];

			(Message.find as jest.Mock).mockResolvedValue(expiredMessages);

			await messageService.cleanupExpiredMessages();

			expect(Message.find).toHaveBeenCalledWith({
				expiresAt: { $lt: new Date() }
			});
			expect(expiredMessages[0].deleteOne).toHaveBeenCalled();
			expect(expiredMessages[1].deleteOne).toHaveBeenCalled();
		});
	});
});

export interface IAttachment {
	filename: string;
	originalname: string;
	mimetype: string;
	size: number;
	path: string;
}

export interface IMessage {
	senderId: string;
	recipientId: string;
	content: string;
	expiresAt?: Date;
	attachments?: IAttachment[];
	status?: 'sent' | 'delivered' | 'read' | 'draft';
}

export interface ITypingIndicator {
	senderId: string;
	recipientId: string;
	isTyping: boolean;
}

export interface IDraft {
	userId: string;
	recipientId: string;
	content: string;
}

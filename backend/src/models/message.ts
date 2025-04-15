import { Document, Schema, model } from 'mongoose';
import { decrypt, encrypt } from '../utils/crypto';

export interface IMessage extends Document {
	senderId: string;
	recipientId: string;
	content: string;
	encryptedContent: string;
	timestamp: Date;
	isRead: boolean;
}

const messageSchema = new Schema<IMessage>({
	senderId: {
		type: String,
		required: true,
		index: true
	},
	recipientId: {
		type: String,
		required: true,
		index: true
	},
	content: {
		type: String,
		required: true
	},
	encryptedContent: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now
	},
	isRead: {
		type: Boolean,
		default: false
	}
});

// Middleware pro šifrování zprávy před uložením
messageSchema.pre('save', async function(next) {
	if (this.isModified('content')) {
		this.encryptedContent = await encrypt(this.content);
	}
	next();
});

// Metoda pro dešifrování zprávy
messageSchema.methods.decryptContent = async function(): Promise<string> {
	return await decrypt(this.encryptedContent);
};

// Statické metody pro práci se zprávami
messageSchema.statics.findByUsers = function(senderId: string, recipientId: string) {
	return this.find({
		$or: [
			{ senderId, recipientId },
			{ senderId: recipientId, recipientId: senderId }
		]
	}).sort({ timestamp: 1 });
};

messageSchema.statics.markAsRead = function(messageIds: string[]) {
	return this.updateMany(
		{ _id: { $in: messageIds } },
		{ $set: { isRead: true } }
	);
};

export const Message = model<IMessage>('Message', messageSchema);

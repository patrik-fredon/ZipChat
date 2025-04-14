import mongoose, { Document, Schema } from 'mongoose';
import { IMessage } from '../types/message.types';

const attachmentSchema = new mongoose.Schema({
	filename: { type: String, required: true },
	originalname: { type: String, required: true },
	mimetype: { type: String, required: true },
	size: { type: Number, required: true },
	path: { type: String, required: true }
});

export interface IMessage extends Document {
	senderId: string;
	recipientId: string;
	content: string;
	iv: string;
	authTag: string;
	keyId: string;
	status: 'sent' | 'delivered' | 'read' | 'draft';
	timestamp: Date;
	readAt?: Date;
	expiresAt?: Date;
	attachments: {
		filename: string;
		originalname: string;
		mimetype: string;
		size: number;
		path: string;
	}[];
}

const messageSchema = new Schema<IMessage>(
	{
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
		iv: {
			type: String,
			required: true
		},
		authTag: {
			type: String,
			required: true
		},
		keyId: {
			type: String,
			required: true
		},
		expiresAt: {
			type: Date,
			index: true
		},
		attachments: [attachmentSchema],
		status: {
			type: String,
			enum: ['sent', 'delivered', 'read', 'draft'],
			default: 'sent',
			index: true
		},
		timestamp: {
			type: Date,
			default: Date.now,
			required: true,
			index: true
		},
		readAt: {
			type: Date
		}
	},
	{
		timestamps: true,
		indexes: [{ senderId: 1, recipientId: 1 }, { recipientId: 1, status: 1 }, { expiresAt: 1 }]
	}
);

// Create compound indexes for efficient querying
messageSchema.index({ senderId: 1, recipientId: 1, timestamp: -1 });
messageSchema.index({ recipientId: 1, status: 1 });

// Add static methods
messageSchema.statics.findByConversation = function (userId: string, otherUserId: string, limit: number = 50, before?: Date) {
	return this.find({
		$or: [
			{ senderId: userId, recipientId: otherUserId },
			{ senderId: otherUserId, recipientId: userId }
		],
		...(before && { timestamp: { $lt: before } })
	})
		.sort({ timestamp: -1 })
		.limit(limit);
};

messageSchema.statics.markAsDelivered = function (messageIds: string[], recipientId: string) {
	return this.updateMany(
		{
			_id: { $in: messageIds },
			recipientId,
			status: 'sent'
		},
		{
			$set: { status: 'delivered' }
		}
	);
};

export const Message = mongoose.model<IMessage>('Message', messageSchema);

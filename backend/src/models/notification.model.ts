import mongoose from 'mongoose';

export interface INotification {
	userId: string;
	type: 'message' | 'friend_request' | 'system' | 'security';
	title: string;
	content: string;
	data?: Record<string, any>;
	read: boolean;
	readAt?: Date;
	createdAt: Date;
	expiresAt?: Date;
}

const notificationSchema = new mongoose.Schema<INotification>({
	userId: {
		type: String,
		required: true,
		index: true
	},
	type: {
		type: String,
		enum: ['message', 'friend_request', 'system', 'security'],
		required: true
	},
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	read: {
		type: Boolean,
		default: false
	},
	readAt: {
		type: Date
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	expiresAt: {
		type: Date
	}
});

// Indexy pro optimalizaci dotazů
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

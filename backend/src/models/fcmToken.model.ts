import mongoose from 'mongoose';

export interface IFCMToken {
	userId: string;
	token: string;
	deviceId: string;
	platform: 'android' | 'ios' | 'web';
	createdAt: Date;
	updatedAt: Date;
}

const fcmTokenSchema = new mongoose.Schema<IFCMToken>({
	userId: {
		type: String,
		required: true,
		index: true
	},
	token: {
		type: String,
		required: true,
		unique: true
	},
	deviceId: {
		type: String,
		required: true
	},
	platform: {
		type: String,
		enum: ['android', 'ios', 'web'],
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Aktualizace updatedAt před uložením
fcmTokenSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

// Indexy pro optimalizaci dotazů
fcmTokenSchema.index({ userId: 1, deviceId: 1 });
fcmTokenSchema.index({ token: 1 }, { unique: true });

export const FCMToken = mongoose.model<IFCMToken>('FCMToken', fcmTokenSchema);

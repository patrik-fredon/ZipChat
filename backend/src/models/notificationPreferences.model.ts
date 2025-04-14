import mongoose from 'mongoose';
import { INotificationPreferences } from '../interfaces/INotificationPreferences';

const notificationPreferencesSchema = new mongoose.Schema<INotificationPreferences>({
	userId: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	emailNotifications: {
		type: Boolean,
		default: true
	},
	pushNotifications: {
		type: Boolean,
		default: true
	},
	inAppNotifications: {
		type: Boolean,
		default: true
	},
	notificationTypes: {
		message: {
			type: Boolean,
			default: true
		},
		friendRequest: {
			type: Boolean,
			default: true
		},
		system: {
			type: Boolean,
			default: true
		},
		security: {
			type: Boolean,
			default: true
		}
	},
	quietHours: {
		enabled: {
			type: Boolean,
			default: false
		},
		startTime: {
			type: String,
			default: '22:00'
		},
		endTime: {
			type: String,
			default: '08:00'
		}
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
notificationPreferencesSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

export const NotificationPreferences = mongoose.model<INotificationPreferences>('NotificationPreferences', notificationPreferencesSchema);

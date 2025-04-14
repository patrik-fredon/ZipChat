export interface INotificationPreferences {
	userId: string;
	emailNotifications: boolean;
	pushNotifications: boolean;
	inAppNotifications: boolean;
	notificationTypes: {
		message: boolean;
		friendRequest: boolean;
		system: boolean;
		security: boolean;
	};
	quietHours: {
		enabled: boolean;
		startTime: string; // HH:mm
		endTime: string; // HH:mm
	};
	createdAt: Date;
	updatedAt: Date;
}

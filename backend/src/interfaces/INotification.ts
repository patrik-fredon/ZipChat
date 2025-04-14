export enum NotificationType {
	MESSAGE = 'MESSAGE',
	FRIEND_REQUEST = 'FRIEND_REQUEST',
	FRIEND_ACCEPT = 'FRIEND_ACCEPT',
	SYSTEM = 'SYSTEM',
	SECURITY = 'SECURITY'
}

export interface INotification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	data?: any;
	isRead: boolean;
	createdAt: Date;
	readAt?: Date;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface IMessage {
	id: string;
	content: string;
	senderId: string;
	recipientId: string;
	timestamp: Date;
	status: MessageStatus;
	isRead: boolean;
}

export interface IMessageGroup {
	messages: IMessage[];
	isCurrentUser: boolean;
}

export interface IMessageComposerProps {
	onSendMessage: (content: string) => Promise<void>;
	disabled?: boolean;
	placeholder?: string;
}

export interface IMessageListProps {
	messages: IMessage[];
	currentUserId: string;
	lastMessageRef: React.RefObject<HTMLDivElement>;
	formatDate: (date: Date) => string;
}

export interface IMessageProps {
	message: IMessage;
	isCurrentUser: boolean;
	showTimestamp: boolean;
	formatDate: (date: Date) => string;
}

export interface IChatWindowProps {
	recipientId: string;
	currentUserId: string;
}

export interface IUserStatus {
	isOnline: boolean;
	lastSeen?: Date;
	isConnected: boolean;
}

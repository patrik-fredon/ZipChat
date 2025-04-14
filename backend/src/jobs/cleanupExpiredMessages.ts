import { logger } from '../lib/logger';
import { Message } from '../models/message.model';

export async function cleanupExpiredMessages(): Promise<void> {
	try {
		const deletedCount = await Message.deleteExpired();
		logger.info(`Deleted ${deletedCount} expired messages`);
	} catch (error) {
		logger.error('Error cleaning up expired messages:', error);
	}
}

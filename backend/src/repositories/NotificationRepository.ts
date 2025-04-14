import { Database } from '../config/Database';
import { INotification } from '../interfaces/INotification';
import { logger } from '../utils/logger';

export class NotificationRepository {
	private db: Database;

	constructor() {
		this.db = Database.getInstance();
	}

	async create(notification: Omit<INotification, 'id'>): Promise<INotification> {
		try {
			const result = await this.db.query(
				`INSERT INTO notifications (
                    user_id, type, title, message, data,
                    is_read, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
				[notification.userId, notification.type, notification.title, notification.message, notification.data, notification.isRead, notification.createdAt]
			);
			return this.mapToNotification(result.rows[0]);
		} catch (error) {
			logger.error('Chyba při vytváření notifikace:', error);
			throw error;
		}
	}

	async findById(id: string): Promise<INotification | null> {
		try {
			const result = await this.db.query('SELECT * FROM notifications WHERE id = $1', [id]);
			return result.rows.length ? this.mapToNotification(result.rows[0]) : null;
		} catch (error) {
			logger.error(`Chyba při hledání notifikace ID: ${id}`, error);
			throw error;
		}
	}

	async findByUserId(userId: string, page: number = 1, limit: number = 20): Promise<INotification[]> {
		try {
			const offset = (page - 1) * limit;
			const result = await this.db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [userId, limit, offset]);
			return result.rows.map((row) => this.mapToNotification(row));
		} catch (error) {
			logger.error(`Chyba při hledání notifikací pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	async countByUserId(userId: string): Promise<number> {
		try {
			const result = await this.db.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1', [userId]);
			return parseInt(result.rows[0].count);
		} catch (error) {
			logger.error(`Chyba při počítání notifikací pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	async countUnreadByUserId(userId: string): Promise<number> {
		try {
			const result = await this.db.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false', [userId]);
			return parseInt(result.rows[0].count);
		} catch (error) {
			logger.error(`Chyba při počítání nepřečtených notifikací pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	async update(notification: INotification): Promise<INotification> {
		try {
			const result = await this.db.query(
				`UPDATE notifications SET
                    type = $1,
                    title = $2,
                    message = $3,
                    data = $4,
                    is_read = $5,
                    read_at = $6
                WHERE id = $7
                RETURNING *`,
				[notification.type, notification.title, notification.message, notification.data, notification.isRead, notification.readAt, notification.id]
			);
			return this.mapToNotification(result.rows[0]);
		} catch (error) {
			logger.error(`Chyba při aktualizaci notifikace ID: ${notification.id}`, error);
			throw error;
		}
	}

	async markAllAsRead(userId: string): Promise<void> {
		try {
			await this.db.query(
				`UPDATE notifications SET
                    is_read = true,
                    read_at = NOW()
                WHERE user_id = $1 AND is_read = false`,
				[userId]
			);
		} catch (error) {
			logger.error(`Chyba při označování všech notifikací jako přečtené pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		try {
			await this.db.query('DELETE FROM notifications WHERE id = $1', [id]);
		} catch (error) {
			logger.error(`Chyba při mazání notifikace ID: ${id}`, error);
			throw error;
		}
	}

	async deleteAllByUserId(userId: string): Promise<void> {
		try {
			await this.db.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
		} catch (error) {
			logger.error(`Chyba při mazání všech notifikací pro uživatele ID: ${userId}`, error);
			throw error;
		}
	}

	private mapToNotification(row: any): INotification {
		return {
			id: row.id,
			userId: row.user_id,
			type: row.type,
			title: row.title,
			message: row.message,
			data: row.data,
			isRead: row.is_read,
			createdAt: row.created_at,
			readAt: row.read_at
		};
	}
}

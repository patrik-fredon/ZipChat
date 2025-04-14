import { z } from 'zod';
import { pgPool } from '../lib/database';

export const MessageSchema = z.object({
	id: z.string().uuid(),
	sender_id: z.string().uuid(),
	recipient_id: z.string().uuid(),
	encrypted_content: z.string(),
	iv: z.string(),
	created_at: z.date(),
	expires_at: z.date().nullable(),
	is_read: z.boolean(),
	is_deleted: z.boolean()
});

export type Message = z.infer<typeof MessageSchema>;

export class MessageModel {
	static async create(message: Omit<Message, 'id' | 'created_at' | 'is_read' | 'is_deleted'>) {
		const query = `
      INSERT INTO messages (sender_id, recipient_id, encrypted_content, iv, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
		const values = [message.sender_id, message.recipient_id, message.encrypted_content, message.iv, message.expires_at];
		const result = await pgPool.query(query, values);
		return result.rows[0];
	}

	static async findByRecipient(recipientId: string) {
		const query = `
      SELECT * FROM messages 
      WHERE recipient_id = $1 
      AND is_deleted = false
      ORDER BY created_at DESC
    `;
		const result = await pgPool.query(query, [recipientId]);
		return result.rows;
	}

	static async markAsRead(id: string) {
		const query = 'UPDATE messages SET is_read = true WHERE id = $1';
		await pgPool.query(query, [id]);
	}

	static async softDelete(id: string) {
		const query = 'UPDATE messages SET is_deleted = true WHERE id = $1';
		await pgPool.query(query, [id]);
	}

	static async cleanupExpired() {
		const query = 'DELETE FROM messages WHERE expires_at < NOW() AND is_deleted = false';
		await pgPool.query(query);
	}
}

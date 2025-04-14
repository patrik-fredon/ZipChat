import { Database } from '../config/Database';
import { IUser } from '../interfaces/IUser';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export class UserRepository {
	private db: Database;

	constructor() {
		this.db = Database.getInstance();
	}

	async save(user: User): Promise<IUser> {
		try {
			const result = await this.db.query(
				`INSERT INTO users (
                    email, password, first_name, last_name, role,
                    created_at, updated_at, last_login_at, is_active,
                    profile_picture, phone_number, two_factor_enabled, email_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *`,
				[user.email, user.password, user.firstName, user.lastName, user.role, user.createdAt, user.updatedAt, user.lastLoginAt, user.isActive, user.profilePicture, user.phoneNumber, user.twoFactorEnabled, user.emailVerified]
			);
			return this.mapToUser(result.rows[0]);
		} catch (error) {
			logger.error('Chyba při ukládání uživatele:', error);
			throw error;
		}
	}

	async findById(id: string): Promise<IUser | null> {
		try {
			const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
			return result.rows.length ? this.mapToUser(result.rows[0]) : null;
		} catch (error) {
			logger.error(`Chyba při hledání uživatele ID: ${id}`, error);
			throw error;
		}
	}

	async findByEmail(email: string): Promise<IUser | null> {
		try {
			const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
			return result.rows.length ? this.mapToUser(result.rows[0]) : null;
		} catch (error) {
			logger.error(`Chyba při hledání uživatele email: ${email}`, error);
			throw error;
		}
	}

	async delete(user: User): Promise<void> {
		try {
			await this.db.query('DELETE FROM users WHERE id = $1', [user.id]);
		} catch (error) {
			logger.error(`Chyba při mazání uživatele ID: ${user.id}`, error);
			throw error;
		}
	}

	private mapToUser(row: any): IUser {
		return {
			id: row.id,
			email: row.email,
			password: row.password,
			firstName: row.first_name,
			lastName: row.last_name,
			role: row.role,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			lastLoginAt: row.last_login_at,
			isActive: row.is_active,
			profilePicture: row.profile_picture,
			phoneNumber: row.phone_number,
			twoFactorEnabled: row.two_factor_enabled,
			emailVerified: row.email_verified
		};
	}
}

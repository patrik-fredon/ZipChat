import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { SecurityError } from '../errors/SecurityError';
import { ValidationError } from '../errors/ValidationError';
import { IUser } from '../interfaces/IUser';
import { logger } from '../utils/logger';
import { UserService } from './UserService';

export class AuthenticationService {
	private userService: UserService;
	private readonly JWT_SECRET: string;
	private readonly JWT_EXPIRES_IN: string;
	private readonly SALT_ROUNDS: number;

	constructor() {
		this.userService = new UserService();
		this.JWT_SECRET = config.jwt.secret;
		this.JWT_EXPIRES_IN = config.jwt.expiresIn;
		this.SALT_ROUNDS = 10;
	}

	async register(userData: Partial<IUser>): Promise<{ user: IUser; token: string }> {
		try {
			// Hashování hesla
			userData.password = await this.hashPassword(userData.password);

			// Vytvoření uživatele
			const user = await this.userService.createUser(userData);

			// Generování JWT tokenu
			const token = this.generateToken(user);

			logger.info(`Nový uživatel zaregistrován: ${user.email}`);
			return { user, token };
		} catch (error) {
			logger.error('Chyba při registraci uživatele:', error);
			throw error;
		}
	}

	async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
		try {
			// Nalezení uživatele
			const user = await this.userService.getUserByEmail(email);
			if (!user) {
				throw new ValidationError('Neplatné přihlašovací údaje');
			}

			// Ověření hesla
			const isValidPassword = await this.verifyPassword(password, user.password);
			if (!isValidPassword) {
				throw new ValidationError('Neplatné přihlašovací údaje');
			}

			// Aktualizace posledního přihlášení
			user.lastLoginAt = new Date();
			await this.userService.updateUser(user.id, user);

			// Generování JWT tokenu
			const token = this.generateToken(user);

			logger.info(`Uživatel přihlášen: ${user.email}`);
			return { user, token };
		} catch (error) {
			logger.error('Chyba při přihlášení:', error);
			throw error;
		}
	}

	async verifyToken(token: string): Promise<IUser> {
		try {
			const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string };
			const user = await this.userService.getUserById(decoded.id);

			if (!user) {
				throw new SecurityError('Neplatný token');
			}

			return user;
		} catch (error) {
			logger.error('Chyba při ověřování tokenu:', error);
			throw new SecurityError('Neplatný token');
		}
	}

	async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
		try {
			const user = await this.userService.getUserById(userId);

			// Ověření starého hesla
			const isValidPassword = await this.verifyPassword(oldPassword, user.password);
			if (!isValidPassword) {
				throw new ValidationError('Neplatné staré heslo');
			}

			// Hashování nového hesla
			const hashedPassword = await this.hashPassword(newPassword);

			// Aktualizace hesla
			await this.userService.updateUser(userId, { password: hashedPassword });

			logger.info(`Heslo změněno pro uživatele ID: ${userId}`);
		} catch (error) {
			logger.error('Chyba při změně hesla:', error);
			throw error;
		}
	}

	async requestPasswordReset(email: string): Promise<string> {
		try {
			const user = await this.userService.getUserByEmail(email);
			if (!user) {
				// Pro bezpečnost nevracíme chybu, že uživatel neexistuje
				return 'Pokud existuje účet s tímto emailem, byl odeslán resetovací odkaz';
			}

			// Generování resetovacího tokenu
			const resetToken = this.generateResetToken(user);

			// TODO: Implementovat odeslání emailu s resetovacím odkazem

			logger.info(`Reset hesla požadován pro: ${email}`);
			return 'Pokud existuje účet s tímto emailem, byl odeslán resetovací odkaz';
		} catch (error) {
			logger.error('Chyba při žádosti o reset hesla:', error);
			throw error;
		}
	}

	async resetPassword(token: string, newPassword: string): Promise<void> {
		try {
			// Ověření resetovacího tokenu
			const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string; type: string };

			if (decoded.type !== 'password_reset') {
				throw new SecurityError('Neplatný resetovací token');
			}

			// Hashování nového hesla
			const hashedPassword = await this.hashPassword(newPassword);

			// Aktualizace hesla
			await this.userService.updateUser(decoded.id, { password: hashedPassword });

			logger.info(`Heslo resetováno pro uživatele ID: ${decoded.id}`);
		} catch (error) {
			logger.error('Chyba při resetu hesla:', error);
			throw new SecurityError('Neplatný nebo expirovaný resetovací token');
		}
	}

	private generateToken(user: IUser): string {
		return jwt.sign({ id: user.id, role: user.role }, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
	}

	private generateResetToken(user: IUser): string {
		return jwt.sign({ id: user.id, type: 'password_reset' }, this.JWT_SECRET, { expiresIn: '1h' });
	}

	private async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, this.SALT_ROUNDS);
	}

	private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	}
}

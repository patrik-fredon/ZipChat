import { Role } from '../enums/Role';
import { NotFoundError } from '../errors/NotFoundError';
import { ValidationError } from '../errors/ValidationError';
import { IUser } from '../interfaces/IUser';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { logger } from '../utils/logger';

export class UserService {
	private userRepository: UserRepository;

	constructor() {
		this.userRepository = new UserRepository();
	}

	async createUser(userData: Partial<IUser>): Promise<IUser> {
		try {
			// Validace vstupních dat
			this.validateUserData(userData);

			// Kontrola existence uživatele
			const existingUser = await this.userRepository.findByEmail(userData.email);
			if (existingUser) {
				throw new ValidationError('Uživatel s tímto emailem již existuje');
			}

			// Vytvoření nového uživatele
			const user = new User(userData);
			await this.userRepository.save(user);

			logger.info(`Uživatel vytvořen: ${user.email}`);
			return user;
		} catch (error) {
			logger.error('Chyba při vytváření uživatele:', error);
			throw error;
		}
	}

	async getUserById(id: string): Promise<IUser> {
		try {
			const user = await this.userRepository.findById(id);
			if (!user) {
				throw new NotFoundError('Uživatel nenalezen');
			}
			return user;
		} catch (error) {
			logger.error(`Chyba při získávání uživatele ID: ${id}`, error);
			throw error;
		}
	}

	async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
		try {
			// Validace vstupních dat
			this.validateUserData(userData);

			const user = await this.getUserById(id);
			Object.assign(user, userData);

			await this.userRepository.save(user);
			logger.info(`Uživatel aktualizován: ${user.email}`);
			return user;
		} catch (error) {
			logger.error(`Chyba při aktualizaci uživatele ID: ${id}`, error);
			throw error;
		}
	}

	async deleteUser(id: string): Promise<void> {
		try {
			const user = await this.getUserById(id);
			await this.userRepository.delete(user);
			logger.info(`Uživatel smazán: ${id}`);
		} catch (error) {
			logger.error(`Chyba při mazání uživatele ID: ${id}`, error);
			throw error;
		}
	}

	async updateUserRole(id: string, role: Role): Promise<IUser> {
		try {
			const user = await this.getUserById(id);
			user.role = role;

			await this.userRepository.save(user);
			logger.info(`Role uživatele aktualizována: ${user.email} -> ${role}`);
			return user;
		} catch (error) {
			logger.error(`Chyba při aktualizaci role uživatele ID: ${id}`, error);
			throw error;
		}
	}

	private validateUserData(userData: Partial<IUser>): void {
		if (userData.email && !this.isValidEmail(userData.email)) {
			throw new ValidationError('Neplatný formát emailu');
		}

		if (userData.password && !this.isValidPassword(userData.password)) {
			throw new ValidationError('Heslo musí obsahovat alespoň 8 znaků, velké písmeno, číslo a speciální znak');
		}
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	private isValidPassword(password: string): boolean {
		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		return passwordRegex.test(password);
	}
}

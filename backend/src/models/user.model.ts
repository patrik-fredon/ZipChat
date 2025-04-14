import bcrypt from 'bcrypt';
import { z } from 'zod';

export interface IUser {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;
}

export const userSchema = z.object({
	username: z.string().min(3).max(30),
	email: z.string().email(),
	password: z.string().min(8),
	publicKey: z.string(),
	privateKey: z.string()
});

export type UserInput = z.infer<typeof userSchema>;

export class User implements IUser {
	id: string;
	username: string;
	email: string;
	passwordHash: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;

	constructor(data: UserInput) {
		this.id = crypto.randomUUID();
		this.username = data.username;
		this.email = data.email;
		this.passwordHash = data.password; // TODO: Hash password
		this.publicKey = data.publicKey;
		this.privateKey = data.privateKey;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	validate(): void {
		userSchema.parse({
			username: this.username,
			email: this.email,
			password: this.passwordHash,
			publicKey: this.publicKey,
			privateKey: this.privateKey
		});
	}

	updateProfile(data: Partial<UserInput>): void {
		if (data.username) this.username = data.username;
		if (data.email) this.email = data.email;
		if (data.password) this.passwordHash = data.password; // TODO: Hash password
		if (data.publicKey) this.publicKey = data.publicKey;
		if (data.privateKey) this.privateKey = data.privateKey;
		this.updatedAt = new Date();
	}

	public async verifyPassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.passwordHash);
	}

	public static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}
}

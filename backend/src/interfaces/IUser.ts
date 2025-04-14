import { Role } from '../enums/Role';

export interface IUser {
	id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: Role;
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
	isActive: boolean;
	profilePicture?: string;
	phoneNumber?: string;
	twoFactorEnabled: boolean;
	emailVerified: boolean;
}

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { logger } from '../lib/logger';

export interface IUser extends mongoose.Document {
	username: string;
	email: string;
	password: string;
	isAdmin: boolean;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
			maxlength: 30
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
		},
		password: {
			type: String,
			required: true,
			minlength: 8
		},
		isAdmin: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true
	}
);

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		logger.error('Error hashing password:', error);
		next(error as Error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		logger.error('Error comparing passwords:', error);
		return false;
	}
};

export const UserModel = mongoose.model<IUser>('User', userSchema);

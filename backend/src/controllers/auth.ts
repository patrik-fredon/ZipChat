import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';
import { UserModel } from '../models/user';

export const register = async (req: Request, res: Response) => {
	try {
		const { username, email, password } = req.body;

		// Check if user exists
		const existingUser = await UserModel.findOne({
			$or: [{ email }, { username }]
		});

		if (existingUser) {
			return res.status(400).json({
				error: 'User with this email or username already exists'
			});
		}

		// Create new user
		const user = new UserModel({
			username,
			email,
			password
		});

		await user.save();

		// Generate JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

		logger.info(`User registered: ${user.email}`);

		res.status(201).json({
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email
			}
		});
	} catch (error) {
		logger.error('Registration error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await UserModel.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

		logger.info(`User logged in: ${user.email}`);

		res.json({
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email
			}
		});
	} catch (error) {
		logger.error('Login error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

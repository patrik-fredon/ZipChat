import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';
import { UserModel } from '../models/user';

interface JwtPayload {
	userId: string;
	iat: number;
	exp: number;
}

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				username: string;
			};
		}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

		const user = await UserModel.findById(decoded.userId);
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		req.user = {
			id: user.id,
			username: user.username
		};

		next();
	} catch (error) {
		logger.error('Authentication error:', error);
		return res.status(401).json({ error: 'Invalid token' });
	}
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	// TODO: Implement admin check
	// if (!req.user.isAdmin) {
	//   return res.status(403).json({ error: 'Forbidden' });
	// }

	next();
};

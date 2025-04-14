import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params
			});
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				logger.error('Validation error:', error.errors);
				return res.status(400).json({
					status: 'error',
					message: 'Validation failed',
					errors: error.errors
				});
			}
			next(error);
		}
	};
};

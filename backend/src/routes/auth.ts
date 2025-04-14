import { Router } from 'express';
import { z } from 'zod';
import { login, register } from '../controllers/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Validation schemas
const registerSchema = z.object({
	body: z.object({
		username: z.string().min(3).max(30),
		email: z.string().email(),
		password: z.string().min(8)
	})
});

const loginSchema = z.object({
	body: z.object({
		email: z.string().email(),
		password: z.string().min(8)
	})
});

// Routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

export default router;

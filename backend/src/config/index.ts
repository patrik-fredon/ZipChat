import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']),
	PORT: z.string().transform(Number),
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES_IN: z.string().default('24h'),
	LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
	DB_HOST: z.string(),
	DB_PORT: z.string().transform(Number),
	DB_USER: z.string(),
	DB_PASSWORD: z.string(),
	DB_NAME: z.string()
});

const config = envSchema.parse(process.env);

export { config };

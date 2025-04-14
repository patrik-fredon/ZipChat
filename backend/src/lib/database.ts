import Redis from 'ioredis';
import mongoose from 'mongoose';
import { Pool } from 'pg';
import { logger } from './logger';

// PostgreSQL
export const pgPool = new Pool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

// Redis
export const redis = new Redis({
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	db: parseInt(process.env.REDIS_DB || '0'),
	retryStrategy: (times) => {
		const delay = Math.min(times * 50, 2000);
		return delay;
	}
});

// MongoDB
export const connectMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zipchat');
		logger.info('Connected to MongoDB');
	} catch (error) {
		logger.error('MongoDB connection error:', error);
		process.exit(1);
	}
};

// Database initialization
export const initDatabase = async () => {
	try {
		// Test PostgreSQL connection
		await pgPool.query('SELECT 1');
		logger.info('Connected to PostgreSQL');

		// Test Redis connection
		await redis.ping();
		logger.info('Connected to Redis');

		// Connect to MongoDB
		await connectMongoDB();
	} catch (error) {
		logger.error('Database initialization error:', error);
		process.exit(1);
	}
};

import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cron from 'node-cron';
import { authRouter } from './api/routes/auth';
import { messageRouter } from './api/routes/messages';
import { userRouter } from './api/routes/users';
import { cleanupExpiredMessages } from './jobs/cleanupExpiredMessages';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error';

config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);
app.use('/api/users', userRouter);

// Schedule cleanup job to run every hour
cron.schedule('0 * * * *', cleanupExpiredMessages);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
	logger.info(`Server running on port ${port}`);
});

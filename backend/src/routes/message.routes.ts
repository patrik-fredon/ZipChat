import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Encrypt and store message
router.post('/encrypt', MessageController.encryptMessage);

// Decrypt message
router.post('/decrypt', MessageController.decryptMessage);

// Rotate encryption keys
router.post('/rotate-keys', MessageController.rotateKeys);

export default router;

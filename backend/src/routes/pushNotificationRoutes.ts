import { Router } from 'express';
import { PushNotificationController } from '../controllers/PushNotificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const pushController = new PushNotificationController();

// Všechny routy vyžadují autentizaci
router.use(authMiddleware);

// Push notifikace
router.post('/push/subscriptions/:userId', pushController.registerSubscription.bind(pushController));
router.delete('/push/subscriptions/:id', pushController.unregisterSubscription.bind(pushController));
router.post('/push/notifications/:userId', pushController.sendNotification.bind(pushController));
router.post('/push/cleanup', pushController.cleanupExpiredSubscriptions.bind(pushController));

export default router; 
import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

// Všechny routy vyžadují autentizaci
router.use(authMiddleware);

// Notifikace
router.post('/notifications', notificationController.createNotification.bind(notificationController));
router.get('/notifications/:userId', notificationController.getNotifications.bind(notificationController));
router.patch('/notifications/:id/read', notificationController.markAsRead.bind(notificationController));
router.delete('/notifications/:id', notificationController.deleteNotification.bind(notificationController));
router.get('/notifications/:userId/unread-count', notificationController.getUnreadCount.bind(notificationController));

export default router; 
import { Router } from 'express';
import { NotificationAnalyticsController } from '../controllers/NotificationAnalyticsController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
const analyticsController = new NotificationAnalyticsController();

// Middleware pro autentizaci a autorizaci
router.use(authenticate);
router.use(authorize(['admin', 'analytics']));

// Získání analytických dat pro konkrétního uživatele
router.get('/user/:userId', analyticsController.getNotificationAnalytics.bind(analyticsController));

// Získání metrik doručení
router.get('/delivery-metrics', analyticsController.getDeliveryMetrics.bind(analyticsController));

// Získání metrik interakce
router.get('/engagement-metrics', analyticsController.getEngagementMetrics.bind(analyticsController));

// Vyčištění starých analytických dat
router.post('/cleanup', analyticsController.cleanupOldAnalytics.bind(analyticsController));

export default router; 
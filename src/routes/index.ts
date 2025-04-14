import { Router } from 'express';
import notificationRoutes from './notification';
import notificationAnalyticsRoutes from './notificationAnalytics';

const router = Router();

// Notification routes
router.use('/notifications', notificationRoutes);

// Notification analytics routes
router.use('/analytics/notifications', notificationAnalyticsRoutes);

export default router; 
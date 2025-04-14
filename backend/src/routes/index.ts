import { Router } from 'express';
import notificationRoutes from './notification';
import notificationABTestRoutes from './notificationABTest';
import notificationAnalyticsRoutes from './notificationAnalytics';

const router = Router();

// Notification routes
router.use('/notifications', notificationRoutes);

// Notification analytics routes
router.use('/analytics/notifications', notificationAnalyticsRoutes);

// Notification A/B test routes
router.use('/ab-tests/notifications', notificationABTestRoutes);

export default router; 
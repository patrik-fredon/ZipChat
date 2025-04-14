import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { notificationSchema } from '../schemas/notificationSchema';

const router = Router();
const notificationController = new NotificationController();

// Získání seznamu notifikací
router.get(
  '/',
  authMiddleware,
  notificationController.getNotifications.bind(notificationController)
);

// Získání počtu nepřečtených notifikací
router.get(
  '/unread/count',
  authMiddleware,
  notificationController.getUnreadCount.bind(notificationController)
);

// Označení notifikace jako přečtené
router.patch(
  '/:id/read',
  authMiddleware,
  notificationController.markAsRead.bind(notificationController)
);

// Smazání notifikace
router.delete(
  '/:id',
  authMiddleware,
  notificationController.deleteNotification.bind(notificationController)
);

// Získání nastavení notifikací
router.get(
  '/preferences',
  authMiddleware,
  notificationController.getPreferences.bind(notificationController)
);

// Aktualizace nastavení notifikací
router.put(
  '/preferences',
  authMiddleware,
  validateRequest(notificationSchema.preferences),
  notificationController.updatePreferences.bind(notificationController)
);

// Registrace push tokenu
router.post(
  '/push/register',
  authMiddleware,
  validateRequest(notificationSchema.pushToken),
  notificationController.registerPushToken.bind(notificationController)
);

// Zrušení registrace push tokenu
router.delete(
  '/push/unregister/:token',
  authMiddleware,
  notificationController.unregisterPushToken.bind(notificationController)
);

export default router; 
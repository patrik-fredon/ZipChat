import { Router } from 'express';
import { FCMTokenController } from '../controllers/fcmToken.controller';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationPreferencesController } from '../controllers/notificationPreferences.controller';
import { authenticate } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';
import { NotificationPreferencesService } from '../services/notificationPreferences.service';
import { WebSocketService } from '../services/websocket.service';

export function createNotificationRoutes(webSocketService: WebSocketService): Router {
	const router = Router();
	const notificationService = new NotificationService(webSocketService, new NotificationPreferencesService());
	const notificationController = new NotificationController(notificationService);
	const preferencesService = new NotificationPreferencesService();
	const preferencesController = new NotificationPreferencesController(preferencesService);
	const fcmTokenController = new FCMTokenController();

	// Všechny notifikační endpointy vyžadují autentizaci
	router.use(authenticate);

	// Vytvoření notifikace
	router.post('/', notificationController.createNotification.bind(notificationController));

	// Získání notifikací pro uživatele
	router.get('/:userId', notificationController.getNotifications.bind(notificationController));

	// Označení notifikací jako přečtené
	router.post('/:userId/read', notificationController.markAsRead.bind(notificationController));

	// Smazání notifikací
	router.delete('/:userId', notificationController.deleteNotifications.bind(notificationController));

	// Získání počtu nepřečtených notifikací
	router.get('/:userId/unread-count', notificationController.getUnreadCount.bind(notificationController));

	// Notifikační preference
	router.get('/preferences/:userId', preferencesController.getPreferences.bind(preferencesController));
	router.put('/preferences/:userId', preferencesController.updatePreferences.bind(preferencesController));

	// FCM tokeny
	router.post('/fcm-token', fcmTokenController.saveToken.bind(fcmTokenController));
	router.delete('/fcm-token', fcmTokenController.removeToken.bind(fcmTokenController));
	router.get('/fcm-token', fcmTokenController.getTokens.bind(fcmTokenController));

	return router;
}

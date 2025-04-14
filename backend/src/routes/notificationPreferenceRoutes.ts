import { Router } from 'express';
import { NotificationPreferenceController } from '../controllers/NotificationPreferenceController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const preferenceController = new NotificationPreferenceController();

// Všechny routy vyžadují autentizaci
router.use(authMiddleware);

// Preference notifikací
router.get('/preferences/:userId', preferenceController.getPreferences.bind(preferenceController));
router.put('/preferences/:userId', preferenceController.updatePreferences.bind(preferenceController));
router.delete('/preferences/:userId', preferenceController.deletePreferences.bind(preferenceController));
router.post('/preferences/:userId/default', preferenceController.createDefaultPreferences.bind(preferenceController));

export default router; 
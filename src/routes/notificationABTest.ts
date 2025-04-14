import { Router } from 'express';
import { NotificationABTestController } from '../controllers/NotificationABTestController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
const testController = new NotificationABTestController();

// Middleware pro autentizaci a autorizaci
router.use(authenticate);
router.use(authorize(['admin', 'analytics']));

// Vytvoření nového testu
router.post('/', testController.createTest.bind(testController));

// Aktualizace testu
router.put('/:testId', testController.updateTest.bind(testController));

// Spuštění testu
router.post('/:testId/start', testController.startTest.bind(testController));

// Dokončení testu
router.post('/:testId/complete', testController.completeTest.bind(testController));

// Zrušení testu
router.post('/:testId/cancel', testController.cancelTest.bind(testController));

// Získání detailů testu
router.get('/:testId', testController.getTest.bind(testController));

// Získání aktivních testů
router.get('/active', testController.getActiveTests.bind(testController));

// Aktualizace metrik testu
router.post('/:testId/metrics', testController.updateTestMetrics.bind(testController));

export default router; 
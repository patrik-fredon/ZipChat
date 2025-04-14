import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

const notificationSchema = z.object({
    userId: z.string(),
    type: z.enum(['message', 'friendRequest', 'system', 'security']),
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).optional()
});

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async createNotification(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = notificationSchema.parse(req.body);
            const notification = await this.notificationService.createNotification(validatedData);
            res.status(201).json(notification);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Neplatná data', details: error.errors });
                return;
            }
            logger.error('Chyba při vytváření notifikace:', error);
            res.status(500).json({ error: 'Nepodařilo se vytvořit notifikaci' });
        }
    }

    async getNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const notifications = await this.notificationService.getNotifications(userId, limit, offset);
            res.json(notifications);
        } catch (error) {
            logger.error('Chyba při získávání notifikací:', error);
            res.status(500).json({ error: 'Nepodařilo se získat notifikace' });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.id;
            await this.notificationService.markAsRead(notificationId);
            res.status(200).json({ message: 'Notifikace označena jako přečtená' });
        } catch (error) {
            logger.error('Chyba při označení notifikace jako přečtené:', error);
            res.status(500).json({ error: 'Nepodařilo se označit notifikaci jako přečtenou' });
        }
    }

    async deleteNotification(req: Request, res: Response): Promise<void> {
        try {
            const notificationId = req.params.id;
            await this.notificationService.deleteNotification(notificationId);
            res.status(200).json({ message: 'Notifikace smazána' });
        } catch (error) {
            logger.error('Chyba při mazání notifikace:', error);
            res.status(500).json({ error: 'Nepodařilo se smazat notifikaci' });
        }
    }

    async getUnreadCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const count = await this.notificationService.getUnreadCount(userId);
            res.json({ count });
        } catch (error) {
            logger.error('Chyba při získávání počtu nepřečtených notifikací:', error);
            res.status(500).json({ error: 'Nepodařilo se získat počet nepřečtených notifikací' });
        }
    }
} 
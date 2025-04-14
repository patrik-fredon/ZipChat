import { Request, Response } from 'express';
import { z } from 'zod';
import { PushNotificationService } from '../services/PushNotificationService';
import { logger } from '../utils/logger';

const subscriptionSchema = z.object({
    endpoint: z.string(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string()
    })
});

const notificationSchema = z.object({
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).optional()
});

export class PushNotificationController {
    private pushService: PushNotificationService;

    constructor() {
        this.pushService = new PushNotificationService();
    }

    async registerSubscription(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const validatedData = subscriptionSchema.parse(req.body);
            
            await this.pushService.registerSubscription(userId, validatedData);
            res.status(201).json({ message: 'Push notifikace zaregistrována' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Neplatná data', details: error.errors });
                return;
            }
            logger.error('Chyba při registraci push notifikace:', error);
            res.status(500).json({ error: 'Nepodařilo se zaregistrovat push notifikaci' });
        }
    }

    async unregisterSubscription(req: Request, res: Response): Promise<void> {
        try {
            const subscriptionId = req.params.id;
            await this.pushService.unregisterSubscription(subscriptionId);
            res.status(200).json({ message: 'Registrace push notifikace zrušena' });
        } catch (error) {
            logger.error('Chyba při zrušení registrace push notifikace:', error);
            res.status(500).json({ error: 'Nepodařilo se zrušit registraci push notifikace' });
        }
    }

    async sendNotification(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const validatedData = notificationSchema.parse(req.body);
            
            await this.pushService.sendPushNotification(
                userId,
                validatedData.title,
                validatedData.body,
                validatedData.data
            );
            
            res.status(200).json({ message: 'Push notifikace odeslána' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Neplatná data', details: error.errors });
                return;
            }
            logger.error('Chyba při odesílání push notifikace:', error);
            res.status(500).json({ error: 'Nepodařilo se odeslat push notifikaci' });
        }
    }

    async cleanupExpiredSubscriptions(req: Request, res: Response): Promise<void> {
        try {
            await this.pushService.cleanupExpiredSubscriptions();
            res.status(200).json({ message: 'Expirované subskripce vyčištěny' });
        } catch (error) {
            logger.error('Chyba při čištění expirovaných subskripcí:', error);
            res.status(500).json({ error: 'Nepodařilo se vyčistit expirované subskripce' });
        }
    }
} 
import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationPreferenceService } from '../services/NotificationPreferenceService';
import { logger } from '../utils/logger';

const preferenceSchema = z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
    quietHours: z.object({
        enabled: z.boolean(),
        start: z.string(),
        end: z.string()
    }).optional(),
    notificationTypes: z.object({
        message: z.boolean(),
        friendRequest: z.boolean(),
        system: z.boolean(),
        security: z.boolean()
    }).optional()
});

export class NotificationPreferenceController {
    private preferenceService: NotificationPreferenceService;

    constructor() {
        this.preferenceService = new NotificationPreferenceService();
    }

    async getPreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const preferences = await this.preferenceService.getPreferences(userId);
            
            if (!preferences) {
                const defaultPreferences = await this.preferenceService.createDefaultPreferences(userId);
                res.json(defaultPreferences);
                return;
            }
            
            res.json(preferences);
        } catch (error) {
            logger.error('Chyba při získávání preferencí notifikací:', error);
            res.status(500).json({ error: 'Nepodařilo se získat preference notifikací' });
        }
    }

    async updatePreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const validatedData = preferenceSchema.parse(req.body);
            
            const preferences = await this.preferenceService.updatePreferences(userId, validatedData);
            res.json(preferences);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: 'Neplatná data', details: error.errors });
                return;
            }
            logger.error('Chyba při aktualizaci preferencí notifikací:', error);
            res.status(500).json({ error: 'Nepodařilo se aktualizovat preference notifikací' });
        }
    }

    async deletePreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            await this.preferenceService.deletePreferences(userId);
            res.status(200).json({ message: 'Preference notifikací smazány' });
        } catch (error) {
            logger.error('Chyba při mazání preferencí notifikací:', error);
            res.status(500).json({ error: 'Nepodařilo se smazat preference notifikací' });
        }
    }

    async createDefaultPreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
            const preferences = await this.preferenceService.createDefaultPreferences(userId);
            res.status(201).json(preferences);
        } catch (error) {
            logger.error('Chyba při vytváření výchozích preferencí:', error);
            res.status(500).json({ error: 'Nepodařilo se vytvořit výchozí preference' });
        }
    }
} 
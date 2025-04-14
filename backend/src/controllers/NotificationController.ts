import { Request, Response } from 'express';
import { NotificationPreferenceService } from '../services/NotificationPreferenceService';
import { NotificationService } from '../services/NotificationService';
import { PushNotificationService } from '../services/PushNotificationService';

export class NotificationController {
  private notificationService: NotificationService;
  private preferenceService: NotificationPreferenceService;
  private pushService: PushNotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.preferenceService = new NotificationPreferenceService();
    this.pushService = new PushNotificationService();
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const notifications = await this.notificationService.getNotifications(
        userId,
        Number(page),
        Number(limit)
      );
      res.json(notifications);
    } catch (error) {
      console.error('Chyba při získávání notifikací:', error);
      res.status(500).json({ message: 'Chyba při získávání notifikací' });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Chyba při získávání počtu nepřečtených notifikací:', error);
      res.status(500).json({ message: 'Chyba při získávání počtu nepřečtených notifikací' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;
      await this.notificationService.markAsRead(userId, notificationId);
      res.json({ message: 'Notifikace označena jako přečtená' });
    } catch (error) {
      console.error('Chyba při označování notifikace jako přečtené:', error);
      res.status(500).json({ message: 'Chyba při označování notifikace jako přečtené' });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;
      await this.notificationService.deleteNotification(userId, notificationId);
      res.json({ message: 'Notifikace smazána' });
    } catch (error) {
      console.error('Chyba při mazání notifikace:', error);
      res.status(500).json({ message: 'Chyba při mazání notifikace' });
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const preferences = await this.preferenceService.getPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error('Chyba při získávání nastavení notifikací:', error);
      res.status(500).json({ message: 'Chyba při získávání nastavení notifikací' });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const preferences = req.body;
      await this.preferenceService.updatePreferences(userId, preferences);
      res.json({ message: 'Nastavení notifikací aktualizováno' });
    } catch (error) {
      console.error('Chyba při aktualizaci nastavení notifikací:', error);
      res.status(500).json({ message: 'Chyba při aktualizaci nastavení notifikací' });
    }
  }

  async registerPushToken(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { token, platform } = req.body;
      await this.pushService.registerToken(userId, token, platform);
      res.json({ message: 'Push token zaregistrován' });
    } catch (error) {
      console.error('Chyba při registraci push tokenu:', error);
      res.status(500).json({ message: 'Chyba při registraci push tokenu' });
    }
  }

  async unregisterPushToken(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const token = req.params.token;
      await this.pushService.unregisterToken(userId, token);
      res.json({ message: 'Push token zrušen' });
    } catch (error) {
      console.error('Chyba při zrušení registrace push tokenu:', error);
      res.status(500).json({ message: 'Chyba při zrušení registrace push tokenu' });
    }
  }
} 
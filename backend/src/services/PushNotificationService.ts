import * as admin from 'firebase-admin';
import { PushTokenRepository } from '../repositories/PushTokenRepository';
import { NotificationPreferenceService } from './NotificationPreferenceService';

export class PushNotificationService {
  private repository: PushTokenRepository;
  private preferenceService: NotificationPreferenceService;

  constructor() {
    this.repository = new PushTokenRepository();
    this.preferenceService = new NotificationPreferenceService();

    // Inicializace Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async registerToken(userId: string, token: string, platform: string) {
    // Validace tokenu
    if (!this.isValidToken(token)) {
      throw new Error('Neplatný push token');
    }

    // Uložení tokenu do databáze
    await this.repository.create({
      userId,
      token,
      platform,
      createdAt: new Date(),
    });
  }

  async unregisterToken(userId: string, token: string) {
    await this.repository.delete(userId, token);
  }

  async sendNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ) {
    // Kontrola, zda má uživatel povoleny push notifikace
    const isAllowed = await this.preferenceService.isNotificationAllowed(
      userId,
      data?.type || 'system',
      'push'
    );

    if (!isAllowed) {
      return;
    }

    // Získání push tokenů uživatele
    const tokens = await this.repository.findByUserId(userId);

    if (tokens.length === 0) {
      return;
    }

    // Příprava zprávy
    const message: admin.messaging.MulticastMessage = {
      tokens: tokens.map(t => t.token),
      notification: {
        title,
        body,
      },
      data,
      android: {
        notification: {
          icon: 'notification_icon',
          color: '#FF5722',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
      webpush: {
        notification: {
          icon: '/icon.png',
          badge: '/badge.png',
        },
      },
    };

    try {
      // Odeslání notifikace
      const response = await admin.messaging().sendMulticast(message);

      // Zpracování výsledků
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => (resp.success ? null : tokens[idx].token))
          .filter(Boolean);

        // Smazání neplatných tokenů
        await Promise.all(
          failedTokens.map(token => this.repository.delete(userId, token as string))
        );
      }
    } catch (error) {
      console.error('Chyba při odesílání push notifikace:', error);
      throw error;
    }
  }

  private isValidToken(token: string): boolean {
    // TODO: Implementovat validaci tokenu
    return true;
  }

  async cleanupExpiredTokens() {
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 30); // Tokeny starší 30 dní
    await this.repository.deleteExpired(expiredDate);
  }
} 
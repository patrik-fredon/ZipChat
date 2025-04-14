import { admin } from '../config/firebase';
import { PushSubscriptionRepository } from '../repositories/PushSubscriptionRepository';
import { PushSubscription } from '../types/notifications';
import { logger } from '../utils/logger';

export class PushNotificationService {
    private subscriptionRepository: PushSubscriptionRepository;

    constructor() {
        this.subscriptionRepository = new PushSubscriptionRepository();
    }

    async registerSubscription(userId: string, subscription: PushSubscription): Promise<void> {
        try {
            await this.subscriptionRepository.create({
                userId,
                ...subscription
            });
        } catch (error) {
            logger.error('Chyba při registraci push notifikace:', error);
            throw new Error('Nepodařilo se zaregistrovat push notifikaci');
        }
    }

    async unregisterSubscription(subscriptionId: string): Promise<void> {
        try {
            await this.subscriptionRepository.delete(subscriptionId);
        } catch (error) {
            logger.error('Chyba při zrušení registrace push notifikace:', error);
            throw new Error('Nepodařilo se zrušit registraci push notifikace');
        }
    }

    async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
        try {
            const subscriptions = await this.subscriptionRepository.findByUserId(userId);
            
            if (!subscriptions || subscriptions.length === 0) {
                logger.info(`Uživatel ${userId} nemá žádné aktivní push notifikace`);
                return;
            }

            const message = {
                notification: {
                    title,
                    body
                },
                data,
                tokens: subscriptions.map(sub => sub.token)
            };

            await admin.messaging().sendMulticast(message);
        } catch (error) {
            logger.error('Chyba při odesílání push notifikace:', error);
            throw new Error('Nepodařilo se odeslat push notifikaci');
        }
    }

    async cleanupExpiredSubscriptions(): Promise<void> {
        try {
            const expiredDate = new Date();
            expiredDate.setDate(expiredDate.getDate() - 30); // Subskripce starší 30 dní
            
            const expiredSubscriptions = await this.subscriptionRepository.findExpired(expiredDate);
            
            for (const subscription of expiredSubscriptions) {
                await this.subscriptionRepository.delete(subscription.id);
            }
        } catch (error) {
            logger.error('Chyba při čištění expirovaných subskripcí:', error);
            throw new Error('Nepodařilo se vyčistit expirované subskripce');
        }
    }
} 
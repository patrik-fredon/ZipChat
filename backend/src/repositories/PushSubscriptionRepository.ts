import { db } from '../config/database';
import { PushSubscription } from '../types/notifications';

export class PushSubscriptionRepository {
  private collection = db.collection('pushSubscriptions');

  async findByUserId(userId: string) {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PushSubscription[];
  }

  async create(subscription: Omit<PushSubscription, 'id'>) {
    const docRef = await this.collection.add(subscription);
    return {
      id: docRef.id,
      ...subscription,
    } as PushSubscription;
  }

  async delete(id: string) {
    await this.collection.doc(id).delete();
  }

  async deleteByUserId(userId: string) {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
} 
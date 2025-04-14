import { db } from '../config/database';
import { NotificationType } from '../types/notifications';

export class NotificationRepository {
	private collection = db.collection('notifications');

	async create(notification: Omit<NotificationType, 'id' | 'createdAt' | 'read'>) {
		const docRef = await this.collection.add({
			...notification,
			createdAt: new Date(),
			read: false,
		});

		return {
			id: docRef.id,
			...notification,
			createdAt: new Date(),
			read: false,
		};
	}

	async findById(id: string) {
		const doc = await this.collection.doc(id).get();
		if (!doc.exists) {
			return null;
		}

		return {
			id: doc.id,
			...doc.data(),
		} as NotificationType;
	}

	async findByUserId(userId: string, skip: number, limit: number) {
		const snapshot = await this.collection
			.where('userId', '==', userId)
			.orderBy('createdAt', 'desc')
			.offset(skip)
			.limit(limit)
			.get();

		return snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
		})) as NotificationType[];
	}

	async countUnread(userId: string) {
		const snapshot = await this.collection
			.where('userId', '==', userId)
			.where('read', '==', false)
			.count()
			.get();

		return snapshot.data().count;
	}

	async markAsRead(id: string) {
		await this.collection.doc(id).update({
			read: true,
		});
	}

	async delete(id: string) {
		await this.collection.doc(id).delete();
	}

	async deleteExpired(expiredDate: Date) {
		const snapshot = await this.collection
			.where('createdAt', '<', expiredDate)
			.get();

		const batch = db.batch();
		snapshot.docs.forEach(doc => {
			batch.delete(doc.ref);
		});

		await batch.commit();
	}
}

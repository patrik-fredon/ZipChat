import { z } from 'zod';

export interface IKey {
	id: string;
	userId: string;
	conversationId: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;
}

export const keySchema = z.object({
	userId: z.string().uuid(),
	conversationId: z.string().uuid(),
	publicKey: z.string(),
	privateKey: z.string()
});

export type KeyInput = z.infer<typeof keySchema>;

export class Key implements IKey {
	id: string;
	userId: string;
	conversationId: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;

	constructor(data: KeyInput) {
		this.id = crypto.randomUUID();
		this.userId = data.userId;
		this.conversationId = data.conversationId;
		this.publicKey = data.publicKey;
		this.privateKey = data.privateKey;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	validate(): void {
		keySchema.parse({
			userId: this.userId,
			conversationId: this.conversationId,
			publicKey: this.publicKey,
			privateKey: this.privateKey
		});
	}

	updateKeys(data: { publicKey?: string; privateKey?: string }): void {
		if (data.publicKey) this.publicKey = data.publicKey;
		if (data.privateKey) this.privateKey = data.privateKey;
		this.updatedAt = new Date();
	}

	rotateKeys(): void {
		// TODO: Implement key rotation
		this.publicKey = crypto.randomUUID();
		this.privateKey = crypto.randomUUID();
		this.updatedAt = new Date();
	}

	public static async rotateKeys(userId: string): Promise<IKey> {
		// Generate new key pair
		const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem'
			}
		});

		// Create new key record
		const newKey = await Key.create({
			userId,
			publicKey: Buffer.from(publicKey).toString('base64'),
			privateKey: Buffer.from(privateKey).toString('base64'),
			isActive: true
		});

		// Deactivate old keys
		await Key.deactivateOldKeys(userId, newKey.id);

		return newKey;
	}

	private static async deactivateOldKeys(userId: string, newKeyId: string): Promise<void> {
		await pgPool.query(
			`
			UPDATE keys
			SET is_active = false
			WHERE user_id = $1 AND id != $2
		`,
			[userId, newKeyId]
		);
	}
}

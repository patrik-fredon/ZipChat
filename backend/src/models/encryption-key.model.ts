import { z } from 'zod';

export interface IEncryptionKey {
	id: string;
	userId: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;
}

export const encryptionKeySchema = z.object({
	userId: z.string().uuid(),
	publicKey: z.string().min(1),
	privateKey: z.string().min(1)
});

export type EncryptionKeyInput = z.infer<typeof encryptionKeySchema>;

export class EncryptionKey implements IEncryptionKey {
	id: string;
	userId: string;
	publicKey: string;
	privateKey: string;
	createdAt: Date;
	updatedAt: Date;

	constructor(data: EncryptionKeyInput) {
		this.id = crypto.randomUUID();
		this.userId = data.userId;
		this.publicKey = data.publicKey;
		this.privateKey = data.privateKey;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	validate(): void {
		encryptionKeySchema.parse({
			userId: this.userId,
			publicKey: this.publicKey,
			privateKey: this.privateKey
		});
	}
}

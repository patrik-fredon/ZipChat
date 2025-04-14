import crypto from 'crypto';
import { z } from 'zod';
import { IKey, Key } from '../models/key.model';

export class EncryptionService {
	private static readonly ALGORITHM = 'aes-256-gcm';
	private static readonly IV_LENGTH = 12;
	private static readonly AUTH_TAG_LENGTH = 16;

	/**
	 * Encrypts a message using the recipient's public key
	 * @param message The message to encrypt
	 * @param recipientId The ID of the recipient
	 * @param senderId The ID of the sender
	 * @returns Encrypted message and metadata
	 */
	public static async encryptMessage(
		message: string,
		recipientId: string,
		senderId: string
	): Promise<{
		encryptedData: string;
		iv: string;
		authTag: string;
		keyId: string;
	}> {
		// Validate input
		const schema = z.object({
			message: z.string().min(1),
			recipientId: z.string().uuid(),
			senderId: z.string().uuid()
		});
		schema.parse({ message, recipientId, senderId });

		// Get recipient's public key
		const recipientKey = await Key.findByUserId(recipientId);
		if (!recipientKey) {
			throw new Error('Recipient key not found');
		}

		// Generate random IV
		const iv = crypto.randomBytes(this.IV_LENGTH);

		// Create cipher
		const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(recipientKey.publicKey, 'base64'), iv);

		// Encrypt message
		let encrypted = cipher.update(message, 'utf8', 'base64');
		encrypted += cipher.final('base64');

		// Get authentication tag
		const authTag = cipher.getAuthTag();

		return {
			encryptedData: encrypted,
			iv: iv.toString('base64'),
			authTag: authTag.toString('base64'),
			keyId: recipientKey.id
		};
	}

	/**
	 * Decrypts a message using the recipient's private key
	 * @param encryptedData The encrypted message
	 * @param iv The initialization vector
	 * @param authTag The authentication tag
	 * @param keyId The ID of the key used for encryption
	 * @param recipientId The ID of the recipient
	 * @returns Decrypted message
	 */
	public static async decryptMessage(encryptedData: string, iv: string, authTag: string, keyId: string, recipientId: string): Promise<string> {
		// Validate input
		const schema = z.object({
			encryptedData: z.string().min(1),
			iv: z.string().min(1),
			authTag: z.string().min(1),
			keyId: z.string().uuid(),
			recipientId: z.string().uuid()
		});
		schema.parse({ encryptedData, iv, authTag, keyId, recipientId });

		// Get recipient's key
		const recipientKey = await Key.findById(keyId);
		if (!recipientKey || recipientKey.userId !== recipientId) {
			throw new Error('Invalid key or recipient');
		}

		// Create decipher
		const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(recipientKey.privateKey, 'base64'), Buffer.from(iv, 'base64'));

		// Set authentication tag
		decipher.setAuthTag(Buffer.from(authTag, 'base64'));

		// Decrypt message
		let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
		decrypted += decipher.final('utf8');

		return decrypted;
	}

	/**
	 * Rotates encryption keys for a user
	 * @param userId The ID of the user
	 * @returns The new key pair
	 */
	public static async rotateKeys(userId: string): Promise<IKey> {
		// Validate input
		const schema = z.object({
			userId: z.string().uuid()
		});
		schema.parse({ userId });

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
}

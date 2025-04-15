import { Message } from '../types';

export class EncryptionService {
    private key: CryptoKey | null = null;

    constructor() {
        this.initializeKey();
    }

    private async initializeKey() {
        try {
            // Zde by měl být kód pro získání šifrovacího klíče
            // Například z localStorage nebo z backendu
            this.key = await this.generateKey();
        } catch (error) {
            console.error('Chyba při inicializaci šifrovacího klíče:', error);
            throw new Error('Nepodařilo se inicializovat šifrovací klíč');
        }
    }

    private async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    public async encryptMessage(message: Message): Promise<string> {
        if (!this.key) {
            throw new Error('Šifrovací klíč není inicializován');
        }

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify(message));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                this.key,
                data
            );

            const encryptedArray = new Uint8Array(encryptedData);
            const result = new Uint8Array(iv.length + encryptedArray.length);
            result.set(iv);
            result.set(encryptedArray, iv.length);

            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Chyba při šifrování zprávy:', error);
            throw new Error('Nepodařilo se zašifrovat zprávu');
        }
    }

    public async decryptMessage(encryptedMessage: string): Promise<Message> {
        if (!this.key) {
            throw new Error('Šifrovací klíč není inicializován');
        }

        try {
            const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
            const iv = encryptedData.slice(0, 12);
            const data = encryptedData.slice(12);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                this.key,
                data
            );

            const decoder = new TextDecoder();
            const decryptedMessage = decoder.decode(decryptedData);
            return JSON.parse(decryptedMessage) as Message;
        } catch (error) {
            console.error('Chyba při dešifrování zprávy:', error);
            throw new Error('Nepodařilo se dešifrovat zprávu');
        }
    }
} 
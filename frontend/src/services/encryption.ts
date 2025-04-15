import { randomBytes } from 'crypto';

export interface EncryptedMessage {
  content: string;
  iv: string;
  key: string;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private algorithm = 'aes-256-gcm';

  private constructor() {}

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  public async encryptMessage(message: string): Promise<EncryptedMessage> {
    try {
      // Generování náhodného klíče a IV
      const key = randomBytes(32);
      const iv = randomBytes(12);

      // Konverze zprávy na Buffer
      const messageBuffer = Buffer.from(message, 'utf-8');

      // Vytvoření šifrovacího klíče
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // Šifrování zprávy
      const encryptedContent = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        cryptoKey,
        messageBuffer
      );

      // Konverze šifrovaného obsahu na Base64
      const encryptedContentBase64 = Buffer.from(encryptedContent).toString('base64');

      return {
        content: encryptedContentBase64,
        iv: iv.toString('base64'),
        key: key.toString('base64'),
      };
    } catch (error) {
      console.error('Chyba při šifrování zprávy:', error);
      throw new Error('Nepodařilo se zašifrovat zprávu');
    }
  }

  public async decryptMessage(encryptedMessage: EncryptedMessage): Promise<string> {
    try {
      // Konverze klíče a IV z Base64 na Buffer
      const key = Buffer.from(encryptedMessage.key, 'base64');
      const iv = Buffer.from(encryptedMessage.iv, 'base64');

      // Vytvoření dešifrovacího klíče
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      // Konverze šifrovaného obsahu z Base64 na Buffer
      const encryptedContent = Buffer.from(encryptedMessage.content, 'base64');

      // Dešifrování zprávy
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        cryptoKey,
        encryptedContent
      );

      // Konverze dešifrovaného obsahu na string
      return Buffer.from(decryptedContent).toString('utf-8');
    } catch (error) {
      console.error('Chyba při dešifrování zprávy:', error);
      throw new Error('Nepodařilo se dešifrovat zprávu');
    }
  }
} 
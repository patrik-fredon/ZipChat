import { useCallback, useState } from 'react';
import { decryptMessage, encryptMessage } from '../utils/encryption';

interface UseEncryptionReturn {
  encrypt: (message: string) => Promise<string>;
  decrypt: (encryptedMessage: string) => Promise<string>;
  isEncrypting: boolean;
  isDecrypting: boolean;
  error: string | null;
}

export const useEncryption = (): UseEncryptionReturn => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (message: string): Promise<string> => {
    setIsEncrypting(true);
    setError(null);
    try {
      const encrypted = await encryptMessage(message);
      return encrypted;
    } catch (err) {
      setError('Nepodařilo se zašifrovat zprávu');
      throw err;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const decrypt = useCallback(async (encryptedMessage: string): Promise<string> => {
    setIsDecrypting(true);
    setError(null);
    try {
      const decrypted = await decryptMessage(encryptedMessage);
      return decrypted;
    } catch (err) {
      setError('Nepodařilo se dešifrovat zprávu');
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    encrypt,
    decrypt,
    isEncrypting,
    isDecrypting,
    error,
  };
}; 
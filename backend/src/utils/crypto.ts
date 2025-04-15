import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const authTagLength = 16;

// Generování klíče z hesla
export async function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey);
    });
  });
}

// Šifrování textu
export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(ivLength);
  const key = await generateKey(process.env.ENCRYPTION_KEY!, process.env.ENCRYPTION_SALT!);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Kombinace IV, zašifrovaného textu a autentizačního tagu
  return Buffer.concat([
    iv,
    Buffer.from(encrypted, 'hex'),
    authTag
  ]).toString('base64');
}

// Dešifrování textu
export async function decrypt(encryptedData: string): Promise<string> {
  const data = Buffer.from(encryptedData, 'base64');
  
  const iv = data.subarray(0, ivLength);
  const encrypted = data.subarray(ivLength, data.length - authTagLength);
  const authTag = data.subarray(data.length - authTagLength);
  
  const key = await generateKey(process.env.ENCRYPTION_KEY!, process.env.ENCRYPTION_SALT!);
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Generování náhodného saltu
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Hashování hesla
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    'sha512'
  ).toString('hex');
}

// Ověření hesla
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashVerify = crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    'sha512'
  ).toString('hex');
  
  return hash === hashVerify;
} 
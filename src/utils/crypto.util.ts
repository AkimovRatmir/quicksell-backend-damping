// crypto.util.ts

import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';

export function encrypt(text: string, secret: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const result = iv.toString('hex') + ':' + Buffer.from(encrypted, 'base64').toString('hex');
  return result;
}

export function decrypt(encrypted: string, secretKey: string): string {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf-8');
}

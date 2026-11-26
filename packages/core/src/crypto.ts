import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ivLength = 12;
const tagLength = 16;

export type EncryptedSecret = {
  keyId: string;
  ciphertext: string;
};

function keyBytes(key: string): Buffer {
  const trimmed = key.trim();
  const bytes = /^[0-9a-fA-F]{64}$/.test(trimmed)
    ? Buffer.from(trimmed, 'hex')
    : Buffer.from(trimmed, 'base64');
  if (bytes.length !== 32) {
    throw new Error('encryption key must be 32 bytes');
  }
  return bytes;
}

export function encryptSecret(plaintext: string, key: string, keyId: string): EncryptedSecret {
  if (!keyId) throw new Error('encryption key id is required');
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv('aes-256-gcm', keyBytes(key), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const packed = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
  return { keyId, ciphertext: packed };
}

export function decryptSecret(payload: EncryptedSecret, key: string): string {
  if (!payload.keyId) throw new Error('encryption key id is required');
  const packed = Buffer.from(payload.ciphertext, 'base64url');
  if (packed.length < ivLength + tagLength) throw new Error('ciphertext is invalid');
  const iv = packed.subarray(0, ivLength);
  const tag = packed.subarray(ivLength, ivLength + tagLength);
  const data = packed.subarray(ivLength + tagLength);
  try {
    const decipher = createDecipheriv('aes-256-gcm', keyBytes(key), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    return plain;
  } catch {
    throw new Error('decryption failed');
  }
}

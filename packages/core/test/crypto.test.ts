import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from '../src/crypto.ts';

const key = '11'.repeat(32);
const otherKey = '22'.repeat(32);

describe('aes-256-gcm', () => {
  it('round-trips and keeps the key id', () => {
    const encrypted = encryptSecret('token-sample', key, 'v1');
    expect(encrypted.keyId).toBe('v1');
    expect(encrypted.ciphertext.includes('token-sample')).toBe(false);
    expect(decryptSecret(encrypted, key)).toBe('token-sample');
  });

  it('fails when the key is wrong', () => {
    const encrypted = encryptSecret('token-sample', key, 'v1');
    expect(() => decryptSecret(encrypted, otherKey)).toThrow('decryption failed');
  });

  it('fails when the auth tag is changed', () => {
    const encrypted = encryptSecret('token-sample', key, 'v1');
    const bytes = Buffer.from(encrypted.ciphertext, 'base64url');
    bytes[14] = bytes[14] === 0 ? 1 : 0;
    expect(() => decryptSecret({ keyId: 'v1', ciphertext: bytes.toString('base64url') }, key)).toThrow(
      'decryption failed',
    );
  });
});

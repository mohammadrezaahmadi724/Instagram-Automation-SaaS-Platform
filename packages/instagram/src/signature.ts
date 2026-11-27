import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyMetaSignature(rawBody: Buffer, signatureHeader: string, appSecret: string) {
  if (!signatureHeader || !appSecret) return false;
  const match = /^sha256=([0-9a-f]+)$/i.exec(signatureHeader.trim());
  const hex = match?.[1];
  if (!hex || hex.length % 2 !== 0) return false;
  const provided = Buffer.from(hex, 'hex');
  const expected = createHmac('sha256', appSecret).update(rawBody).digest();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

export function readSignedRequest(
  signedRequest: string,
  appSecret: string,
): { user_id: string } | null {
  if (!signedRequest || !appSecret) return null;
  const [encodedSig, payload] = signedRequest.split('.');
  if (!encodedSig || !payload || signedRequest.split('.').length !== 2) return null;
  const provided = decodeBase64Url(encodedSig);
  const expected = createHmac('sha256', appSecret).update(payload).digest();
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  try {
    const data = JSON.parse(decodeBase64Url(payload).toString('utf8')) as { user_id?: unknown };
    if (typeof data.user_id !== 'string' || !data.user_id) return null;
    return { user_id: data.user_id };
  } catch {
    return null;
  }
}

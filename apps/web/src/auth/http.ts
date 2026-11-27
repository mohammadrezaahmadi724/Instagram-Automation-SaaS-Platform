import { NextResponse } from 'next/server';

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function sessionCookie(token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `directora_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `directora_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function readCookie(header: string | null, name: string) {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export function clientIp(request: Request) {
  if (process.env.NODE_ENV !== 'production' && process.env.OTP_TEST_HELPER === '1') {
    const testIp = request.headers.get('x-directora-test-ip')?.trim();
    if (testIp) return testIp.slice(0, 80);
  }
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'local';
}

const metaSignaturePaths = new Set([
  '/api/webhooks/instagram',
  '/api/instagram/deauthorize',
  '/api/instagram/data-deletion',
]);

export function rejectCrossSite(request: Request) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return null;
  if (metaSignaturePaths.has(new URL(request.url).pathname)) return null;
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const host = request.headers.get('host');
  try {
    if (!host || new URL(origin).host !== host) return jsonError('درخواست رد شد', 403);
  } catch {
    return jsonError('درخواست رد شد', 403);
  }
  return null;
}

import { NextResponse } from 'next/server';
import { jsonError, readCookie } from '../../../../../src/auth/http';
import { startInstagramOauth } from '../../../../../src/instagram/gateway';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const result = await startInstagramOauth(token);
  if (!result.ok) return jsonError(result.error, result.status);
  return NextResponse.redirect(result.data.url);
}

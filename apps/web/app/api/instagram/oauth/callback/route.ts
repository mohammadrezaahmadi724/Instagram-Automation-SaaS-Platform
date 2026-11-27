import { NextResponse } from 'next/server';
import { finishInstagramOauth } from '../../../../../src/instagram/gateway';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? '';
  const code = url.searchParams.get('code') ?? '';
  const back = new URL('/app/instagram', request.url);
  if (!state || !code) {
    back.searchParams.set('error', 'failed');
    return NextResponse.redirect(back);
  }
  const result = await finishInstagramOauth(state, code);
  if (!result.ok) {
    back.searchParams.set(
      'error',
      result.status === 409 ? 'taken' : result.status === 400 ? 'professional' : 'failed',
    );
    return NextResponse.redirect(back);
  }
  back.searchParams.set('connected', '1');
  return NextResponse.redirect(back);
}

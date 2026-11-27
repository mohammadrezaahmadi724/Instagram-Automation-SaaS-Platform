import { normalizeIranMobile } from '../../../../../src/auth/phone';
import { readTestCode } from '../../../../../src/auth/sms';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.OTP_TEST_HELPER !== '1') {
    return new Response(null, { status: 404 });
  }
  const phone = normalizeIranMobile(new URL(request.url).searchParams.get('phone') ?? '');
  const code = phone ? await readTestCode(phone) : null;
  if (!code) return new Response(null, { status: 404 });
  return Response.json({ code });
}

import { z } from 'zod';
import { clientIp, jsonError, rejectCrossSite, sessionCookie } from '../../../../../src/auth/http';
import { verifyOtp } from '../../../../../src/auth/service';

const bodySchema = z.object({
  phone: z.string().min(1).max(20),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('شماره یا کد معتبر نیست', 400);
  const userAgent = request.headers.get('user-agent');
  const result = await verifyOtp(parsed.data.phone, parsed.data.code, {
    ip: clientIp(request),
    ...(userAgent ? { userAgent } : {}),
  });
  if (!result.ok) return jsonError(result.error, result.status);
  const response = Response.json({ ok: true });
  response.headers.append('set-cookie', sessionCookie(result.data.token, result.data.maxAge));
  return response;
}

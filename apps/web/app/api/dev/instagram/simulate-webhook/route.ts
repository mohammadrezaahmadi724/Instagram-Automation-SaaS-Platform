import { z } from 'zod';
import { jsonError, readCookie, rejectCrossSite } from '../../../../../src/auth/http';
import { simulateWebhook } from '../../../../../src/instagram/gateway';

const bodySchema = z.object({
  kind: z.enum(['comment', 'dm']),
  text: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('رویداد آزمایشی معتبر نیست', 400);
  const result = await simulateWebhook(token, parsed.data);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

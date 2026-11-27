import { z } from 'zod';
import { clientIp, jsonError, rejectCrossSite } from '../../../../../src/auth/http';
import { requestOtp } from '../../../../../src/auth/service';

const bodySchema = z.object({ phone: z.string().min(1).max(20) });

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('شماره موبایل ایران معتبر نیست', 400);
  const result = await requestOtp(parsed.data.phone, clientIp(request));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json({ sent: true });
}

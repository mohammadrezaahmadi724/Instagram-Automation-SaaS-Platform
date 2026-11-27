import { z } from 'zod';
import { jsonError, readCookie, rejectCrossSite } from '../../../src/auth/http';
import { renameUser } from '../../../src/auth/service';

const bodySchema = z.object({ displayName: z.string().min(2).max(80) });

export async function PATCH(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('نام نمایشی معتبر نیست', 400);
  const result = await renameUser(token, parsed.data.displayName);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

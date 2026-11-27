import { z } from 'zod';
import { jsonError, readCookie, rejectCrossSite } from '../../../../src/auth/http';
import { switchWorkspace } from '../../../../src/auth/service';

const bodySchema = z.object({ workspaceId: z.string().uuid() });

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('فضای کاری معتبر نیست', 400);
  const result = await switchWorkspace(token, parsed.data.workspaceId);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

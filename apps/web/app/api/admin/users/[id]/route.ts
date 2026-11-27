import { guardAdmin } from '../../../../../src/admin/http';
import { setUserActive } from '../../../../../src/admin/service';
import { jsonError } from '../../../../../src/auth/http';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { isActive?: boolean } | null;
  if (typeof body?.isActive !== 'boolean') return jsonError('وضعیت کاربر معتبر نیست', 400);
  const result = await setUserActive(guard.userId, id, body.isActive);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

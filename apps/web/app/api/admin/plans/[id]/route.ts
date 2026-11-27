import { guardAdmin } from '../../../../../src/admin/http';
import { savePlan } from '../../../../../src/admin/service';
import { jsonError } from '../../../../../src/auth/http';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const { id } = await context.params;
  const result = await savePlan(id, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

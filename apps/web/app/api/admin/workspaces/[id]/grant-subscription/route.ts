import { grantSubscription } from '../../../../../../src/admin/service';
import { guardAdmin } from '../../../../../../src/admin/http';
import { jsonError } from '../../../../../../src/auth/http';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { planId?: string } | null;
  if (!body?.planId) return jsonError('پلن لازم است', 400);
  const result = await grantSubscription(id, body.planId);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

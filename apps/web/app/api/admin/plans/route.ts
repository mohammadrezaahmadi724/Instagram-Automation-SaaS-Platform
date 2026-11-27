import { guardAdmin } from '../../../../src/admin/http';
import { listPlans, savePlan } from '../../../../src/admin/service';
import { jsonError } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const plans = await listPlans();
  if (!plans) return jsonError('داده در دسترس نیست', 500);
  return Response.json({ plans });
}

export async function POST(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const result = await savePlan(null, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data, { status: 201 });
}

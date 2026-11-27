import { guardAdmin } from '../../../../src/admin/http';
import { adminStats } from '../../../../src/admin/service';
import { jsonError } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const stats = await adminStats();
  if (!stats) return jsonError('داده در دسترس نیست', 500);
  return Response.json(stats);
}

import { guardAdmin } from '../../../../src/admin/http';
import { listUsers } from '../../../../src/admin/service';
import { jsonError } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const query = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  const users = await listUsers(query);
  if (!users) return jsonError('داده در دسترس نیست', 500);
  return Response.json({ users });
}

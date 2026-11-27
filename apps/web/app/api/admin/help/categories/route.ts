import { createCategory, listHelpAdmin } from '../../../../../src/admin/help';
import { guardAdmin } from '../../../../../src/admin/http';
import { jsonError } from '../../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const categories = await listHelpAdmin();
  if (!categories) return jsonError('داده در دسترس نیست', 500);
  return Response.json({ categories });
}

export async function POST(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const result = await createCategory(await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data, { status: 201 });
}

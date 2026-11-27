import { guardAdmin } from '../../../../src/admin/http';
import { listReceipts } from '../../../../src/admin/service';
import { jsonError } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const data = await listReceipts(url.searchParams.get('status'), page);
  if (!data) return jsonError('داده در دسترس نیست', 500);
  return Response.json(data);
}

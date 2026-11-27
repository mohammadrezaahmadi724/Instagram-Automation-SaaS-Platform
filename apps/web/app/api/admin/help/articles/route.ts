import { getPrisma } from '@directora/db';
import { createArticle } from '../../../../../src/admin/help';
import { guardAdmin } from '../../../../../src/admin/http';
import { jsonError } from '../../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const url = process.env.DATABASE_URL;
  if (!url) return jsonError('داده در دسترس نیست', 500);
  const articles = await getPrisma(url).helpArticle.findMany({ orderBy: { sortOrder: 'asc' } });
  return Response.json({ articles });
}

export async function POST(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const result = await createArticle(await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data, { status: 201 });
}

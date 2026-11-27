import { guardAdmin } from '../../../../src/admin/http';
import { readSettings, writeSettings } from '../../../../src/admin/service';
import { jsonError } from '../../../../src/auth/http';

export async function GET(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const settings = await readSettings();
  if (!settings) return jsonError('داده در دسترس نیست', 500);
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const guard = await guardAdmin(request);
  if ('response' in guard) return guard.response;
  const result = await writeSettings(guard.userId, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

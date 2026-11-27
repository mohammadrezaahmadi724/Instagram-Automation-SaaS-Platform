import { jsonError, readCookie } from '../../../../../../src/auth/http';
import { listRecentMedia } from '../../../../../../src/instagram/gateway';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const { id } = await context.params;
  const result = await listRecentMedia(token, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json({ media: result.data });
}

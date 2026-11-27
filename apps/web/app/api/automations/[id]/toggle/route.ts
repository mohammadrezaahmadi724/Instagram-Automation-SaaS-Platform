import { jsonError, readCookie, rejectCrossSite } from '../../../../../src/auth/http';
import { toggleAutomation } from '../../../../../src/instagram/gateway';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const { id } = await context.params;
  const result = await toggleAutomation(token, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

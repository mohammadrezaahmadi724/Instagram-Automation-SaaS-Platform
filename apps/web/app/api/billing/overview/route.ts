import { jsonError, readCookie } from '../../../../src/auth/http';
import { billingOverview } from '../../../../src/billing/service';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const result = await billingOverview(token);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

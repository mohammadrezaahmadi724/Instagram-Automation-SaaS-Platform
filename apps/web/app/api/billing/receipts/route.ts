import { jsonError, readCookie, rejectCrossSite } from '../../../../src/auth/http';
import { submitReceipt } from '../../../../src/billing/service';

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const result = await submitReceipt(token, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data, { status: 201 });
}

import { jsonError, readCookie, rejectCrossSite } from '../../../../../src/auth/http';
import { connectMockAccount } from '../../../../../src/instagram/gateway';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const result = await connectMockAccount(token);
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data);
}

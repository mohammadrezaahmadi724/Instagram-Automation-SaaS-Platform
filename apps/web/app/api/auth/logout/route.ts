import { clearSessionCookie, readCookie, rejectCrossSite } from '../../../../src/auth/http';
import { revokeSession } from '../../../../src/auth/service';

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (token) await revokeSession(token).catch(() => undefined);
  const response = Response.json({ ok: true });
  response.headers.append('set-cookie', clearSessionCookie());
  return response;
}

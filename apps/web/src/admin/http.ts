import { jsonError, readCookie, rejectCrossSite } from '../auth/http';
import { requireSuperAdmin } from './service';

export async function guardAdmin(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return { response: blocked };
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  const auth = await requireSuperAdmin(token);
  if (!auth.ok) return { response: jsonError(auth.error, auth.status) };
  return { userId: auth.userId };
}

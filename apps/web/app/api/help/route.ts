import { jsonError, readCookie } from '../../../src/auth/http';
import { currentProfile } from '../../../src/auth/service';
import { publishedHelp } from '../../../src/help/queries';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const profile = await currentProfile(token);
  if (!profile.ok) return jsonError(profile.error, profile.status);
  return Response.json(await publishedHelp());
}

import { jsonError, readCookie, rejectCrossSite } from '../../../src/auth/http';
import { currentProfile } from '../../../src/auth/service';
import { saveAutomation } from '../../../src/instagram/gateway';
import { listRules } from '../../../src/instagram/queries';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const profile = await currentProfile(token);
  if (!profile.ok || !profile.data.workspace) return jsonError('وارد نشده‌اید', 401);
  const rules = await listRules(profile.data.workspace.id);
  return Response.json({
    rules: rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      status: rule.status,
      triggerType: rule.triggerType,
      matchType: rule.matchType,
      keywords: rule.keywords,
      executionCount: rule.executionCount,
      username: rule.instagramAccount.username,
    })),
  });
}

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const result = await saveAutomation(token, await request.json().catch(() => null));
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json(result.data, { status: 201 });
}

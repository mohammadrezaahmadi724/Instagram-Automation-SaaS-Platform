import { jsonError, readCookie } from '../../../src/auth/http';
import { currentProfile } from '../../../src/auth/service';
import { listLogs } from '../../../src/instagram/queries';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const profile = await currentProfile(token);
  if (!profile.ok || !profile.data.workspace) return jsonError('وارد نشده‌اید', 401);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const result = await listLogs(profile.data.workspace.id, {
    status: url.searchParams.get('status') ?? undefined,
    triggerType: url.searchParams.get('triggerType') ?? undefined,
    ruleId: url.searchParams.get('ruleId') ?? undefined,
    accountId: url.searchParams.get('accountId') ?? undefined,
    page: Number.isFinite(page) ? page : 1,
  });
  return Response.json({
    total: result.total,
    page: result.page,
    logs: result.rows.map((row) => ({
      id: row.id,
      status: row.status,
      triggerType: row.triggerType,
      matchedKeyword: row.matchedKeyword,
      errorCode: row.errorCode,
      createdAt: row.createdAt.toISOString(),
      ruleName: row.rule?.name ?? null,
    })),
  });
}

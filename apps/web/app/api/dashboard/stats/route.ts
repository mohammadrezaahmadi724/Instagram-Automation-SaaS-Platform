import { jsonError, readCookie } from '../../../../src/auth/http';
import { currentProfile } from '../../../../src/auth/service';
import { dashboardStats } from '../../../../src/instagram/gateway';

export async function GET(request: Request) {
  const token = readCookie(request.headers.get('cookie'), 'directora_session');
  if (!token) return jsonError('وارد نشده‌اید', 401);
  const profile = await currentProfile(token);
  if (!profile.ok || !profile.data.workspace) return jsonError('وارد نشده‌اید', 401);
  const stats = await dashboardStats(profile.data.workspace.id);
  return Response.json({
    accounts: stats.accounts,
    activeRules: stats.activeRules,
    today: stats.today,
    success30: stats.success30,
    successRate: stats.successRate,
    planName: stats.planName,
    remainingDays: stats.remainingDays,
    progress: stats.progress,
  });
}

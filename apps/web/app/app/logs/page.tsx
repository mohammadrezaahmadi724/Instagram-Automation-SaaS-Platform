import { listLogs } from '../../../src/instagram/queries';
import { requireProfile } from '../../../src/panel/queries';
import { LogsTable } from './logs-table';

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; triggerType?: string; ruleId?: string; accountId?: string; page?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const result = await listLogs(profile.workspace.id, {
    status: params.status,
    triggerType: params.triggerType,
    ruleId: params.ruleId,
    accountId: params.accountId,
    page: Number(params.page ?? '1'),
  });
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">گزارش ارسال</h1>
      <form className="flex flex-wrap gap-3" method="get">
        <select name="status" defaultValue={params.status ?? ''} aria-label="وضعیت" className="min-h-11 rounded-md border border-input bg-surface px-3">
          <option value="">همهٔ وضعیت‌ها</option>
          <option value="SUCCESS">موفق</option>
          <option value="FAILED">ناموفق</option>
          <option value="SKIPPED_COOLDOWN">کول‌داون</option>
          <option value="SKIPPED_WINDOW">خارج از پنجره</option>
          <option value="SKIPPED_PLAN_LIMIT">سقف پلن</option>
        </select>
        <button type="submit" className="min-h-11 rounded-md border border-border px-4">فیلتر</button>
      </form>
      <LogsTable
        rows={result.rows.map((row) => ({
          id: row.id,
          createdAt: row.createdAt.toISOString(),
          ruleName: row.rule?.name ?? '—',
          triggerType: row.triggerType,
          matchedKeyword: row.matchedKeyword ?? '—',
          status: row.status,
          errorCode: row.errorCode ?? '',
        }))}
      />
    </div>
  );
}

import { roleAtLeast } from '../../../src/auth/roles';
import { listAccounts } from '../../../src/instagram/queries';
import { requireProfile } from '../../../src/panel/queries';
import { InstagramPanel } from './instagram-panel';

const notices: Record<string, string> = {
  connected: 'حساب اینستاگرام وصل شد.',
  professional: 'فقط حساب حرفه‌ای بیزنس یا کریتور پذیرفته می‌شود.',
  taken: 'این حساب به فضای کاری دیگری متصل است.',
  failed: 'اتصال انجام نشد.',
};

export default async function InstagramPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const profile = await requireProfile();
  const params = await searchParams;
  const accounts = await listAccounts(profile.workspace.id);
  const notice = params.connected === '1' ? notices.connected : (notices[params.error ?? ''] ?? '');
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">حساب‌های اینستاگرام</h1>
      <InstagramPanel
        accounts={accounts.map((account) => ({
          id: account.id,
          username: account.username,
          name: account.name,
          followersCount: account.followersCount,
          status: account.status,
          tokenExpiresAt: account.tokenExpiresAt?.toISOString() ?? null,
        }))}
        metaConfigured={Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET)}
        mockMode={
          process.env.NODE_ENV !== 'production' && process.env.INSTAGRAM_API_MODE !== 'live'
        }
        canManage={roleAtLeast(profile.workspace.role, 'ADMIN')}
        notice={notice ?? ''}
      />
    </div>
  );
}

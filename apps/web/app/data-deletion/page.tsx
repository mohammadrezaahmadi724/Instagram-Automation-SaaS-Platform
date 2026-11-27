import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { loadSession } from '../../src/auth/service';
import { MarketingShell } from '../../src/marketing/shell';

export const metadata: Metadata = {
  title: 'حذف داده | دایرکتورا',
  description: 'چگونه دادهٔ اینستاگرام و حساب دایرکتورا حذف می‌شود.',
};

export default async function DataDeletionPage() {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = token ? await loadSession(token) : null;
  return (
    <MarketingShell loggedIn={Boolean(session)}>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-3xl font-bold">حذف داده‌ها</h1>
        <p>از پنل، اتصال پیج را قطع کنید. توکن رمزشده و اشتراک وب‌هوک همان حساب پاک می‌شود.</p>
        <p>
          متا می‌تواند callback حذف داده را هم صدا بزند. دایرکتورا همان درخواست را ثبت می‌کند و دادهٔ
          پیج را حذف می‌کند.
        </p>
        <p>
          پس از حذف، توکن و محتوای دسترسی پیج باقی نمی‌ماند. ممکن است یک سابقهٔ حداقلی از خود درخواست
          حذف، بدون توکن، برای اثبات انجام کار بماند.
        </p>
      </article>
    </MarketingShell>
  );
}

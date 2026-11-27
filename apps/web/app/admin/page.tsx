import { formatRialAsToman, toPersianDigits } from '@directora/core';
import { StatCard } from '@directora/ui';
import Link from 'next/link';
import { adminStats } from '../../src/admin/service';

export default async function AdminHomePage() {
  const stats = await adminStats();
  if (!stats) return <p>داده در دسترس نیست</p>;
  const cards = [
    ['کاربران', stats.users],
    ['فضاهای کاری', stats.workspaces],
    ['حساب‌های متصل', stats.connectedAccounts],
    ['اشتراک پرداخت‌شده', stats.paidSubscriptions],
    ['فیش در انتظار', stats.pendingReceipts],
  ] as const;
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">داشبورد مدیریت</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <StatCard key={label} label={label} value={toPersianDigits(String(value))} />
        ))}
        <StatCard label="مجموع تأییدشده" value={formatRialAsToman(BigInt(stats.approvedAmountRial))} />
      </div>
      <Link href="/admin/receipts" className="inline-flex min-h-11 items-center text-link">
        فیش‌های در انتظار
      </Link>
    </div>
  );
}

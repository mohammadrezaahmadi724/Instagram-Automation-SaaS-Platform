import { getPrisma } from '@directora/db';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { loadSession } from '../../src/auth/service';
import { MarketingShell } from '../../src/marketing/shell';

export const metadata: Metadata = {
  title: 'تماس | دایرکتورا',
  description: 'راه‌های ارتباط با پشتیبانی دایرکتورا.',
};

export default async function ContactPage() {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = token ? await loadSession(token) : null;
  const url = process.env.DATABASE_URL;
  const setting = url
    ? await getPrisma(url).systemSetting.findUnique({ where: { key: 'support.contact' } })
    : null;
  const contact =
    setting?.valueJson && typeof setting.valueJson === 'object'
      ? (setting.valueJson as Record<string, string>)
      : {};
  const rows = [
    ['تلگرام', contact.telegram],
    ['واتساپ', contact.whatsapp],
    ['تلفن', contact.phone],
    ['ایمیل', contact.email],
  ].filter((item): item is [string, string] => Boolean(item[1]?.trim()));
  return (
    <MarketingShell loggedIn={Boolean(session)}>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-3xl font-bold">ارتباط با ما</h1>
        {rows.length === 0 ? (
          <p className="text-subtle">راه تماس هنوز در تنظیمات پلتفرم ثبت نشده است.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map(([label, value]) => (
              <li key={label}>
                {label}: <bdi dir="ltr">{value}</bdi>
              </li>
            ))}
          </ul>
        )}
      </article>
    </MarketingShell>
  );
}

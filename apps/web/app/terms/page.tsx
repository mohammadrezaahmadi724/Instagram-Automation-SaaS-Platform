import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { loadSession } from '../../src/auth/service';
import { MarketingShell } from '../../src/marketing/shell';

export const metadata: Metadata = {
  title: 'شرایط استفاده | دایرکتورا',
  description: 'شرایط استفاده از اتوماسیون رسمی اینستاگرام در دایرکتورا.',
};

export default async function TermsPage() {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = token ? await loadSession(token) : null;
  return (
    <MarketingShell loggedIn={Boolean(session)}>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-3xl font-bold">شرایط استفاده</h1>
        <p>
          استفاده از دایرکتورا به معنی پذیرش سیاست‌های متا است. ارسال فقط در پنجره‌های رسمی است: دایرکت و استوری ۲۴
          ساعت، و پاسخ خصوصی هر کامنت یک بار تا ۷ روز. دایرکت سرد، پیام انبوه و فالو یا آنفالو خودکار ارائه نمی‌شود.
        </p>
        <p>
          اشتراک پولی با کارت‌به‌کارت و تأیید دستی فعال می‌شود. تا قبل از تأیید، پلن پرداخت‌شده فعال نیست. درگاه آنلاین
          هنوز بخشی از این نسخه نیست.
        </p>
        <p>اگر حساب قوانین را نقض کند یا تعلیق شود، ورود بعدی رد می‌شود حتی اگر نشست قبلی هنوز منقضی نشده باشد.</p>
      </article>
    </MarketingShell>
  );
}

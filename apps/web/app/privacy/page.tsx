import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { loadSession } from '../../src/auth/service';
import { MarketingShell } from '../../src/marketing/shell';

export const metadata: Metadata = {
  title: 'حریم خصوصی | دایرکتورا',
  description: 'داده‌هایی که دایرکتورا از حساب اینستاگرام و فضای کاری نگه می‌دارد.',
};

export default async function PrivacyPage() {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = token ? await loadSession(token) : null;
  return (
    <MarketingShell loggedIn={Boolean(session)}>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
        <h1 className="text-3xl font-bold">سیاست حفظ حریم خصوصی</h1>
        <p>
          دایرکتورا برای اتصال پیج فقط دادهٔ Instagram Graph API را می‌گیرد: شناسهٔ پیج، نام کاربری، نوع حساب و
          توکن دسترسی. توکن با AES-256-GCM رمز می‌شود. رمز عبور اینستاگرام هرگز دریافت یا ذخیره نمی‌شود.
        </p>
        <p>
          شماره موبایل، نام نمایشی، فضای کاری، عضویت، دستورهای اتوماسیون و گزارش ارسال برای کارکرد محصول نگه داشته
          می‌شوند. این داده‌ها با شناسهٔ فضای کاری جدا می‌شوند.
        </p>
        <p>
          می‌توانید اتصال پیج را از پنل قطع کنید یا از مسیر حذف داده بخواهید دادهٔ اینستاگرام پاک شود. راه‌های تماس در
          صفحهٔ تماس است.
        </p>
      </article>
    </MarketingShell>
  );
}

import { formatRialAsToman, toPersianDigits } from '@directora/core';
import { getPrisma } from '@directora/db';
import { Badge, Card, CardContent } from '@directora/ui';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { loadSession } from '../src/auth/service';
import { MarketingShell } from '../src/marketing/shell';

export const metadata: Metadata = {
  title: 'دایرکتورا | اتوماسیون رسمی اینستاگرام',
  description: 'پاسخ خودکار به کامنت، دایرکت و استوری با API رسمی متا، بدون رمز عبور پیج.',
};

const features = [
  ['کامنت به دایرکت', 'کلیدواژهٔ کامنت را به یک دایرکت تبدیل کنید.'],
  ['پاسخ خودکار دایرکت و استوری', 'فقط داخل پنجرهٔ رسمی ۲۴ ساعته.'],
  ['اتصال رسمی بدون رمز عبور', 'فقط حساب حرفه‌ای بیزنس یا کریتور.'],
  ['گزارش لحظه‌ای', 'نتیجهٔ هر ارسال در گزارش پنل دیده می‌شود.'],
  ['چند فضای کاری و تیم', 'نقش مالک، مدیر، اپراتور و بیننده جداست.'],
  ['رمزنگاری توکن', 'توکن دسترسی با AES-256-GCM ذخیره می‌شود.'],
];

const questions = [
  ['آیا رمز پیج لازم است؟', 'نه. اتصال فقط با ورود رسمی متا است و رمز اینستاگرام گرفته یا ذخیره نمی‌شود.'],
  ['آیا API رسمی است؟', 'بله. فقط Instagram Platform روی graph.instagram.com استفاده می‌شود.'],
  ['پنجرهٔ ۲۴ ساعته و ۷ روزه چیست؟', 'دایرکت و پاسخ استوری تا ۲۴ ساعت پس از اقدام کاربر است. پاسخ خصوصی هر کامنت یک بار و تا ۷ روز است.'],
  ['دورهٔ آزمایشی چند روز است؟', 'پلن آزمایشی ۷ روز است.'],
  ['تفاوت پلن زیر و بالای ۲۵ هزار فالوور چیست؟', 'پلن رشد تا ۲۴۹۹۹ فالوور است و پلن حرفه‌ای از ۲۵۰۰۰ فالوور به بالا.'],
  ['پرداخت چطور انجام می‌شود؟', 'کارت‌به‌کارت است. شماره پیگیری را ثبت می‌کنید و مدیر پلتفرم فیش را تأیید می‌کند. درگاه آنلاین هنوز فعال نیست.'],
];

function tier(code: string, maxFollowers: number | null, minFollowers: number) {
  if (code === 'FREE_TRIAL') return 'آزمایشی ۷ روزه';
  if (code === 'AGENCY') return 'آژانس';
  if (maxFollowers !== null && maxFollowers < 25000) return 'زیر ۲۵ هزار فالوور';
  if (minFollowers >= 25000) return 'بالای ۲۵ هزار فالوور';
  return 'پلن فعال';
}

export default async function HomePage() {
  await connection();
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = token ? await loadSession(token) : null;
  const url = process.env.DATABASE_URL;
  const plans = url
    ? await getPrisma(url).plan.findMany({ where: { isActive: true }, orderBy: { priceRial: 'asc' } })
    : [];
  return (
    <MarketingShell loggedIn={Boolean(session)}>
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-extrabold leading-tight">اتوماسیون هوشمند و ۱۰۰٪ رسمی اینستاگرام</h1>
          <p className="text-lg text-subtle">
            پاسخ خودکار به کامنت، دایرکت و استوری، بدون نیاز به رمز عبور پیج.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center rounded-md bg-accent px-5 text-lg font-medium text-accent-foreground"
            >
              شروع ۷ روز رایگان
            </Link>
            <a href="#pricing" className="inline-flex min-h-12 items-center rounded-md border border-border px-5">
              مشاهده تعرفه‌ها
            </a>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <Badge>نمونهٔ تصویری</Badge>
            <p className="font-semibold">دستور: قیمت</p>
            <p className="rounded-md bg-surface-sunken p-3 text-sm">کامنت: قیمت؟</p>
            <p className="rounded-md border border-border p-3 text-sm">دایرکت: فهرست قیمت را برایتان فرستادم.</p>
            <p className="text-sm text-muted">این کارت دادهٔ زندهٔ مشتری نیست.</p>
          </CardContent>
        </Card>
      </section>
      <section id="features" className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        {features.map(([title, text]) => (
          <article key={title} className="rounded-lg border border-border bg-surface p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-subtle">{text}</p>
          </article>
        ))}
      </section>
      <section id="pricing" className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8">
        <h2 className="text-3xl font-bold">تعرفه‌ها</h2>
        {plans.length === 0 ? (
          <p className="text-subtle">تعرفه‌ای در پایگاه داده ثبت نشده است.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <article key={plan.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
                <h3 className="text-lg font-semibold">{plan.nameFa}</h3>
                <Badge>{tier(plan.code, plan.maxFollowers, plan.minFollowers)}</Badge>
                <p className="tabular-nums text-2xl font-bold">{formatRialAsToman(plan.priceRial)}</p>
                <p className="text-sm text-subtle">
                  {toPersianDigits(String(plan.maxInstagramAccounts))} حساب ·{' '}
                  {toPersianDigits(String(plan.durationDays))} روز
                </p>
                <Link href="/login" className="inline-flex min-h-11 items-center text-link">
                  شروع با این پلن
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <section id="faq" className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8">
        <h2 className="text-3xl font-bold">سوالات متداول</h2>
        {questions.map(([question, answer]) => (
          <details key={question} className="rounded-lg border border-border bg-surface p-4">
            <summary className="min-h-11 cursor-pointer font-medium">{question}</summary>
            <p className="mt-2 text-sm leading-7 text-subtle">{answer}</p>
          </details>
        ))}
      </section>
    </MarketingShell>
  );
}

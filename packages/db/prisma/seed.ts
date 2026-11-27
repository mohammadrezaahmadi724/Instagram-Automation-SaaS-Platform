import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrisma } from '../src/client.ts';

try {
  process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env'));
} catch {
  // CI can inject DATABASE_URL without a file.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('seed: DATABASE_URL is required');
  process.exit(1);
}

const prisma = getPrisma(databaseUrl);

// قیمت، سقف اجرا و فلگ‌ها جای‌نگهدارند. Super Admin در پرامپت پرداخت آن‌ها را عوض می‌کند.
const plans = [
  {
    code: 'FREE_TRIAL',
    nameFa: 'آزمایشی',
    priceRial: 0n,
    durationDays: 7,
    maxInstagramAccounts: 1,
    maxMonthlyExecutions: 100,
    minFollowers: 0,
    maxFollowers: null,
    featuresJson: { aiReply: false, smsAddon: false, formBuilder: false, showcase: false },
  },
  {
    code: 'GROWTH_UNDER_25K',
    nameFa: 'رشد',
    priceRial: 4_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 1,
    maxMonthlyExecutions: 2_000,
    minFollowers: 0,
    maxFollowers: 24_999,
    featuresJson: { aiReply: false, smsAddon: false, formBuilder: false, showcase: false },
  },
  {
    code: 'PRO_OVER_25K',
    nameFa: 'حرفه‌ای',
    priceRial: 9_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 3,
    maxMonthlyExecutions: 20_000,
    minFollowers: 25_000,
    maxFollowers: null,
    featuresJson: { aiReply: true, smsAddon: false, formBuilder: false, showcase: false },
  },
  {
    code: 'AGENCY',
    nameFa: 'آژانس',
    priceRial: 29_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 10,
    maxMonthlyExecutions: 100_000,
    minFollowers: 0,
    maxFollowers: null,
    featuresJson: { aiReply: true, smsAddon: true, formBuilder: true, showcase: true },
  },
] as const;

const settings = [
  {
    key: 'billing.card_to_card',
    valueJson: {
      cardNumber: '',
      iban: '',
      accountHolderName: 'شماره کارت را در /admin/settings وارد کنید',
    },
  },
  {
    key: 'support.contact',
    valueJson: { telegram: '', whatsapp: '', phone: '', email: '' },
  },
];

const help = [
  {
    slug: 'getting-started',
    titleFa: 'شروع کار',
    icon: 'ش',
    article: {
      slug: 'otp-and-trial',
      titleFa: 'ورود با کد یک‌بارمصرف و دورهٔ آزمایشی',
      summaryFa: 'با شماره موبایل وارد می‌شوید و هفت روز آزمایشی می‌گیرید.',
      bodyMd:
        'ورود فقط با کد یک‌بارمصرف پیامکی است. پس از ورود، فضای کاری شما ساخته می‌شود و پلن آزمایشی هفت‌روزه فعال است. رمز عبور اینستاگرام هیچ‌جا خواسته نمی‌شود.',
    },
  },
  {
    slug: 'instagram-connect',
    titleFa: 'اتصال پیج اینستاگرام',
    icon: 'ا',
    article: {
      slug: 'official-connect',
      titleFa: 'اتصال رسمی بدون رمز عبور',
      summaryFa: 'فقط حساب حرفه‌ای بیزنس یا کریتور از مسیر Meta وصل می‌شود.',
      bodyMd:
        'اتصال از OAuth رسمی اینستاگرام است. حساب شخصی پذیرفته نمی‌شود. توکن در حالت سکون رمز می‌شود و در صفحه نمایش داده نمی‌شود.',
    },
  },
  {
    slug: 'comment-to-dm',
    titleFa: 'کامنت به دایرکت و پاسخ خودکار',
    icon: 'د',
    article: {
      slug: 'build-a-rule',
      titleFa: 'ساخت دستور و پیش‌نمایش دایرکت',
      summaryFa: 'کلیدواژه را بگذارید و پاسخ را پیش از فعال‌سازی ببینید.',
      bodyMd:
        'از صفحهٔ دستورها یک اتوماسیون کامنت‌به‌دایرکت بسازید. تطبیق می‌تواند دقیق، شامل، یا هر پیامی باشد. پیش‌نمایش، شکل پیام را نشان می‌دهد و دادهٔ زندهٔ مشتری نیست.',
    },
  },
  {
    slug: 'instagram-limits',
    titleFa: 'محدودیت‌های رسمی اینستاگرام',
    icon: 'م',
    article: {
      slug: 'messaging-windows',
      titleFa: 'پنجرهٔ ۲۴ ساعته و پاسخ خصوصی هفت‌روزه',
      summaryFa: 'دایرکت سرد ارسال نمی‌شود و هر کامنت فقط یک پاسخ خصوصی دارد.',
      bodyMd:
        'دایرکت و ریپلای استوری فقط تا ۲۴ ساعت پس از اقدام کاربر ارسال می‌شود. پاسخ خصوصی به هر کامنت یک بار و تا هفت روز است. پیام انبوه، اسکرپ فالوور و فالو یا آنفالو خودکار در دایرکتورا نیست.',
    },
  },
  {
    slug: 'billing',
    titleFa: 'پرداخت و خرید اشتراک',
    icon: 'پ',
    article: {
      slug: 'card-to-card',
      titleFa: 'کارت‌به‌کارت و انتظار تأیید',
      summaryFa: 'مبلغ را واریز می‌کنید و شماره پیگیری را ثبت می‌کنید.',
      bodyMd:
        'پرداخت نسخهٔ فعلی کارت‌به‌کارت است. مبلغ را سرور از قیمت پلن می‌خواند. پس از ثبت فیش، وضعیت «در انتظار بررسی» می‌ماند تا مدیر آن را تأیید کند. پلن‌ها بر اساس سقف دنبال‌کننده جدا شده‌اند. درگاه آنلاین هنوز فعال نیست.',
    },
  },
  {
    slug: 'policies',
    titleFa: 'قوانین و مقررات',
    icon: 'ق',
    article: {
      slug: 'legal-pages',
      titleFa: 'حریم خصوصی، شرایط و حذف داده',
      summaryFa: 'متن‌های حقوقی عمومی محصول اینجاست.',
      bodyMd:
        'سیاست حفظ حریم خصوصی در /privacy، شرایط استفاده در /terms و راهنمای حذف داده در /data-deletion است. قطع اتصال پیج از داخل پنل توکن را پاک می‌کند.',
    },
  },
];

for (const plan of plans) {
  await prisma.plan.upsert({
    where: { code: plan.code },
    create: { ...plan, isActive: true },
    update: {
      nameFa: plan.nameFa,
      priceRial: plan.priceRial,
      durationDays: plan.durationDays,
      maxInstagramAccounts: plan.maxInstagramAccounts,
      maxMonthlyExecutions: plan.maxMonthlyExecutions,
      minFollowers: plan.minFollowers,
      maxFollowers: plan.maxFollowers,
      featuresJson: plan.featuresJson,
      isActive: true,
    },
  });
}

for (const setting of settings) {
  await prisma.systemSetting.upsert({
    where: { key: setting.key },
    create: setting,
    update: {},
  });
}

for (const [index, category] of help.entries()) {
  const saved = await prisma.helpCategory.upsert({
    where: { slug: category.slug },
    create: {
      slug: category.slug,
      titleFa: category.titleFa,
      icon: category.icon,
      sortOrder: index,
      isActive: true,
    },
    update: { titleFa: category.titleFa, icon: category.icon, sortOrder: index, isActive: true },
  });
  await prisma.helpArticle.upsert({
    where: { slug: category.article.slug },
    create: {
      categoryId: saved.id,
      slug: category.article.slug,
      titleFa: category.article.titleFa,
      summaryFa: category.article.summaryFa,
      bodyMd: category.article.bodyMd,
      sortOrder: 0,
      isPublished: true,
    },
    update: {
      titleFa: category.article.titleFa,
      summaryFa: category.article.summaryFa,
      bodyMd: category.article.bodyMd,
      isPublished: true,
    },
  });
}

await prisma.$disconnect();
console.log(
  `seed: ${plans.length} plans, ${settings.length} settings, ${help.length} help categories`,
);

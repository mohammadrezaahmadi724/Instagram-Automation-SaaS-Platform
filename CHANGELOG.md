# Changelog

وضعیت سند: پیش‌نویس فاز ۱ب

تاریخ: 1405/09/04

قالب این فایل Keep a Changelog است.

## [0.5.0-phase2b] - 1405/09/06

### Added

- کلاینت رسمی Instagram API، تأیید امضای webhook و تطبیق دستور.
- OAuth، callbackهای deauthorize و حذف داده، گیرندهٔ webhook و شبیه‌ساز dev.
- پردازش صف `instagram.webhook` و تمدید توکن long-lived.
- صفحه و API حساب، دستور، گزارش و آمار داشبورد.
- تست واحد، integration و e2e برای همین مسیر.

## [0.4.0-phase2a] - 1405/09/06

### Changed

- تست بصری Playwright فقط با baseline لینوکس یا `UPDATE_SNAPSHOTS=1` روی لینوکس اجرا می‌شود.
- ADR-009 و ADR-011 Accepted شدند. مبلغ به‌صورت ریال صحیح Accepted شد.
- اسکیمای MVP، seed چهار پلن، و هلپر AES-256-GCM اضافه شد.
- ورود با OTP موبایل، نشست سمت سرور، تعویض Workspace و RBAC اضافه شد.
- صفحه‌های `/login` و پنل `/app` به داده‌ی واقعی وصل شدند.
- تست واحد، integration و e2e برای ورود و پنل اضافه شد.

## [0.3.0-phase1c] - 1405/09/04

### Added

- پوسته‌ی راست‌چین با sidebar، topbar، breadcrumb و page header.
- کامپوننت‌های باقی‌مانده‌ی سیستم طراحی، فونت JetBrains Mono و کاتالوگ `/design`.
- workflow گیت‌هاب برای verify، integration و e2e.

## [0.2.1-phase1b-fix] - 1405/09/04

### Fixed

- پورت‌های Postgres و Redis دایرکتورا روی `55432` و `56379` قابل تنظیم شدند تا با سرویس‌های دیگر ماشین تداخل نکنند.
- بارگذاری `.env` ریشه با `process.loadEnvFile` جایگزین پارسر دست‌ساز شد. CSP گزارش‌فقط کامل‌تر شد و `/api/health?deep=1` وضعیت db و redis را جدا برمی‌گرداند.
- کلاس‌های `packages/ui` با `@source` وارد Tailwind شدند. تست integration فقط با `RUN_INTEGRATION=1` اجرا می‌شود و در غیر این صورت با پیام صریح skip می‌شود. روی ویندوز، runner دستور را یک‌رشته‌ای با shell اجرا می‌کند تا `spawn` روی `pnpm.cmd` با `EINVAL` شکست نخورد.

## [0.2.0-phase1b] - 1405/09/04

### Added

- اسکلت monorepo با `apps/web`، `apps/worker` و پکیج‌های `@directora/ui`، `@directora/core`، `@directora/db`، `@directora/instagram` و `@directora/config`.
- `docs/10-database.md` برای schema اولیه و طرح RLS.
- صفحه‌ی نمایش سیستم طراحی، `GET /api/health`، و worker با صف واقعی `system`.

### Changed

- پالت `Iris` با پالت لوگوی دایرکتورا (`blue`، `cyan`، `ink`، `orange`، `amber`) جایگزین شد. توکن‌های تم تیره و `--border-input` در `docs/09-design-system.md` ثبت شد.
- `ADR-014` به نام برند محدود و `Accepted` شد: دایرکتورا / Directora. دامنه به `ADR-016` با وضعیت `Proposed` منتقل شد.
- `ADR-017` نسخه‌های پین‌شده‌ی اسکلت را با وضعیت `Accepted` ثبت کرد.
- نام موقت محصول در سندهای جاری به «دایرکتورا» تغییر کرد.
- `QUEUE_DRIVER` از `.env.example` حذف شد، چون ADR-003 صف را روی BullMQ ثابت کرده است.

### Fixed

- تاریخ اشتباه سندهای فاز ۱الف به `1405/09/04` برگشت.
- دو بند تکراری درباره‌ی Root در بخش `Fixed` نسخه‌ی ۱الف یکی شد.

## [0.1.0-phase1a] - 1405/09/04

### Added

- `docs/09-design-system.md`: سیستم طراحی Iris/Ink، توکن‌ها، کنتراست، کامپوننت‌ها و چک‌لیست کیفیت UI.
- `.gitattributes`: قفل کردن انتهای خط LF برای فایل‌های متنی.
- `ADR-015`: پشته‌ی UI و سیستم طراحی، با وضعیت `Accepted`.

### Changed

- `.cursor/rules/00-project-core.mdc`: مسیر Root به مخزن فعلی اصلاح شد و قانون پوشه‌ی والد جای قانون قبلی را گرفت.
- `.cursor/rules/06-ui-ux.mdc`: بازنویسی قانون‌های اجباری UI، RTL و توکن‌ها. globها برای `apps/web` و `packages/ui` هستند که در 01b ساخته می‌شوند.
- `README.md`: وضعیت فاز ۱الف، درخت Root جدید، و خلاصه‌ی Stack پذیرفته‌شده.
- `docs/00-project-overview.md`: وضعیت فاز ۱الف و لینک سیستم طراحی.
- `docs/01-product-scope.md`: تعریف MVP، Handover/Conversation Routing، و یادداشت توصیه‌ی ورود.
- `docs/03-instagram-api-constraints.md`: مدل توکن Instagram Login بدون refresh token جدا.
- `docs/04-architecture-decisions.md`: پذیرش ADR-001، ADR-002، ADR-003 و ADR-012، تاریخ شمسی، و توصیه‌های ATLAS روی ADRهای باز.
- `docs/05-roadmap.md`: فاز ۰ انجام‌شده، تقسیم فاز ۱ و فاز ۲، و به‌روزرسانی Kanban.
- `docs/06-security-requirements.md`: رمزنگاری و تمدید توکن long-lived، بدون refresh token جدا.
- `docs/07-ui-ux-principles.md`: ارجاع پالت، فونت و توکن‌ها به سیستم طراحی.
- `docs/08-glossary.md`: تعریف `IGSID` و مدخل‌های طراحی و Conversation Routing.
- `.gitignore`: الگوهای Next.js، TypeScript و ابزار تست.

### Fixed

- مسیر Root در قانون پروژه و README با محل واقعی مخزن یکی شد. پوشه‌ی والد فقط نگه‌دارنده است و جزو مخزن نیست.
- تاریخ ADRها به تقویم شمسی، با معادل میلادی، یکدست شد.

## [0.0.1-phase0] - 1405/09/04

### Added

- `.cursor/rules/00-project-core.mdc`
- `.cursor/rules/01-instagram-api-compliance.mdc`
- `.cursor/rules/02-no-fake-ui-and-testability.mdc`
- `.cursor/rules/03-security.mdc`
- `.cursor/rules/04-architecture-and-adr.mdc`
- `.cursor/rules/05-workflow-and-reporting.mdc`
- `.cursor/rules/06-ui-ux.mdc`
- `docs/00-project-overview.md`
- `docs/01-product-scope.md`
- `docs/02-competitor-research-directam.md`
- `docs/03-instagram-api-constraints.md`
- `docs/04-architecture-decisions.md`
- `docs/05-roadmap.md`
- `docs/06-security-requirements.md`
- `docs/07-ui-ux-principles.md`
- `docs/08-glossary.md`
- `.env.example`
- `.gitignore`
- `README.md`
- `CHANGELOG.md`
- No application code; stack not selected (ADR-000)

# دایرکتورا (Directora)

وضعیت سند: پیش‌نویس فاز ۲

تاریخ: 1405/09/06

## Summary

دایرکتورا یک SaaS چندمستأجره برای اتوماسیون رسمی اینستاگرام کسب‌وکارهای ایرانی است. نام فارسی «دایرکتورا» و نام لاتین «Directora» است (ADR-014). دامنه هنوز انتخاب نشده است (ADR-016).

## Status

`Phase 2 — OTP login, workspace, and authenticated panel, in progress`

فاز ۱ج در ۱۴۰۵/۰۹/۰۶ انجام شده است. فاز ۲ ورود با OTP، فضای کاری و پنل `/app` را می‌سازد. اتصال اینستاگرام هنوز شروع نشده است.

## Tech stack (accepted)

- [ADR-001](docs/04-architecture-decisions.md): `TypeScript`، `Next.js`، `Node.js`، `pnpm`، `Prisma`، `zod`، و ابزار تست و کیفیت کد.
- [ADR-002](docs/04-architecture-decisions.md): `PostgreSQL` با یک schema مشترک و ستون `workspace_id`، به‌علاوه‌ی Row-Level Security.
- [ADR-003](docs/04-architecture-decisions.md): `BullMQ` روی `Redis` و worker جدا.
- [ADR-012](docs/04-architecture-decisions.md): monorepo با `pnpm` workspaces و `Turborepo`.
- [ADR-015](docs/04-architecture-decisions.md): `Tailwind CSS` 4، الگوی `shadcn/ui`، و سیستم طراحی.

ADR-001، ADR-002، ADR-003، ADR-012 و ADR-015 بازبینی شده و در نقشه‌ی راه `انجام‌شده` هستند. ADR-009 (ورود OTP)، ADR-011 (رمزنگاری AES-256-GCM)، ADR-014 و ADR-017 هم `Accepted` هستند. ADR-004 تا ADR-008، ADR-010، ADR-013 و ADR-016 (دامنه) هنوز `Proposed`اند.

## Key principles

1. فقط API رسمی Meta مجاز است و رمز اینستاگرام هرگز گرفته یا ذخیره نمی‌شود.
2. هیچ دکمه یا قابلیت نمایشی بدون عملکرد واقعی ساخته نمی‌شود.
3. هر مرحله قابل تست و تأیید است.
4. امنیت در اولویت است و معماری بدون ADR تغییر نمی‌کند. بازنویسی کامل بدون دلیل فنی جدی ممنوع است.
5. این پروژه از سایت‌ها و پروژه‌های دیگر مالک جداست.

بیان کامل اصول در [docs/00-project-overview.md](docs/00-project-overview.md) است.

## Repository layout

```
Instagram Automation SaaS Platform/
├─ .cursor/
│  └─ rules/
│     ├─ 00-project-core.mdc
│     ├─ 01-instagram-api-compliance.mdc
│     ├─ 02-no-fake-ui-and-testability.mdc
│     ├─ 03-security.mdc
│     ├─ 04-architecture-and-adr.mdc
│     ├─ 05-workflow-and-reporting.mdc
│     ├─ 06-ui-ux.mdc
│     └─ 07-code-conventions.mdc
├─ apps/
│  ├─ web/
│  └─ worker/
├─ packages/
│  ├─ config/
│  ├─ core/
│  ├─ db/
│  ├─ instagram/
│  └─ ui/
├─ docs/
│  ├─ 00-project-overview.md
│  ├─ 01-product-scope.md
│  ├─ 02-competitor-research-directam.md
│  ├─ 03-instagram-api-constraints.md
│  ├─ 04-architecture-decisions.md
│  ├─ 05-roadmap.md
│  ├─ 06-security-requirements.md
│  ├─ 07-ui-ux-principles.md
│  ├─ 08-glossary.md
│  ├─ 09-design-system.md
│  └─ 10-database.md
├─ .env.example
├─ .gitattributes
├─ .git/
├─ .gitignore
├─ CHANGELOG.md
└─ README.md
```

## Documents

- [Project overview](docs/00-project-overview.md)
- [Product scope](docs/01-product-scope.md)
- [Competitor research](docs/02-competitor-research-directam.md)
- [Instagram API constraints](docs/03-instagram-api-constraints.md)
- [Architecture decisions](docs/04-architecture-decisions.md)
- [Roadmap](docs/05-roadmap.md)
- [Security requirements](docs/06-security-requirements.md)
- [UI/UX principles](docs/07-ui-ux-principles.md)
- [Glossary](docs/08-glossary.md)
- [Design system](docs/09-design-system.md)
- [Database design](docs/10-database.md)

## Collaboration

مالک محصول (Mamal) تسک را تعریف می‌کند. ناظر فنی (ATLAS) تحلیل می‌کند و پرامپت می‌نویسد. مجری (Cursor) اجرا و گزارش می‌دهد. ATLAS خروجی را با فایل‌های واقعی تطبیق می‌دهد و تأیید یا پرامپت اصلاحی صادر می‌کند. سپس نقشه‌ی راه به‌روز می‌شود.

## Getting started

پیش‌نیاز: Node `24.15` یا بالاتر (`.nvmrc`)، pnpm 12.23.0، و Docker Desktop. نسخه‌ی 24.7 فعلی این ماشین برای `jsdom@31` کافی نیست و باید ارتقا یابد. این مخزن Node را نصب یا ارتقا نمی‌دهد.

```powershell
pnpm install
pnpm services:up
pnpm db:migrate:dev
pnpm dev
pnpm verify
pnpm test:e2e
pnpm test:integration
```

## پورت‌ها

Postgres و Redis دایرکتورا فقط روی loopback منتشر می‌شوند: `127.0.0.1:55432` و `127.0.0.1:56379`. متغیرهای `DIRECTORA_PG_PORT` و `DIRECTORA_REDIS_PORT` همین مقدارها را عوض می‌کنند. `DATABASE_URL` و `REDIS_URL` باید همان پورت را داشته باشند. پورت‌های 5432 و 6379 مال سرویس‌های دیگر همین ماشین‌اند و استفاده نمی‌شوند.

## کاتالوگ طراحی

`/design` در توسعه همیشه باز است. در production فقط با `DESIGN_CATALOG=1` باز می‌شود و `robots` آن `noindex` است. خانه‌ی سایت یک معرفی کوتاه است و دکمه‌ی «ورود به پنل» به `/login` می‌رود. بعد از ورود، پنل روی `/app` است.

ورود فقط با رمز یک‌بارمصرف موبایل است. متغیرهای نمونه، بدون مقدار واقعی، در `.env.example` هستند: `SMS_PROVIDER=console`، `AUTH_SECRET`، `ENCRYPTION_KEY` (۳۲ بایت hex یا base64)، `ENCRYPTION_KEY_ID=v1` و `SESSION_TTL_DAYS=30`. مقدار واقعی فقط در `.env` می‌ماند و commit نمی‌شود.

اتصال اینستاگرام فقط API رسمی Meta است. `INSTAGRAM_API_MODE=live` به `graph.instagram.com` می‌رود. `mock` فقط وقتی `NODE_ENV` برابر production نیست مجاز است و ارسال را بدون شبکه برمی‌گرداند؛ در production اگر حالت `live` نباشد سرویس بالا نمی‌آید. متغیرهای خالی: `META_APP_ID`، `META_APP_SECRET`، `META_WEBHOOK_VERIFY_TOKEN`، `META_OAUTH_REDIRECT_URI` (روی `127.0.0.1`، نه localhost). مسیرها: `GET /api/instagram/oauth/start`، `GET /api/instagram/oauth/callback`، `POST /api/instagram/deauthorize`، `POST /api/instagram/data-deletion`، `GET /api/webhooks/instagram` و `POST /api/webhooks/instagram`. در توسعه، با mock، دکمهٔ «اتصال پیج آزمایشی» و «شبیه‌ساز تست وب‌هوک» همان صف واقعی را تغذیه می‌کنند. این مسیر جایگزین App Review نیست؛ webhook زنده برای کاربران واقعی به تأیید Meta نیاز دارد.

`pnpm test:integration` به Postgres روی `127.0.0.1:55432` و Redis روی `127.0.0.1:56379` نیاز دارد. اگر این سرویس‌ها بالا نباشند، دستور شکست می‌خورد و تست را رد نمی‌کند.

`toHaveScreenshot` فقط روی لینوکس اجرا می‌شود، و فقط وقتی `UPDATE_SNAPSHOTS=1` باشد یا فایل‌های `*-chromium-linux.png` در `apps/web/e2e/smoke.spec.ts-snapshots/` وجود داشته باشند. اگر baseline نباشد آن assertionها skip می‌شوند و job e2e سبز می‌ماند. تست‌های کارکردی و axe همیشه اجرا می‌شوند. برای ساخت baseline، روی لینوکس `UPDATE_SNAPSHOTS=1 pnpm test:e2e` را بزنید و فقط PNGهای لینوکس را commit کنید. از artifact همان job در CI هم می‌شود همان فایل‌ها را برداشت. اسکرین‌شات کامل صفحه در `apps/web/test-results/screenshots/` است و commit نمی‌شود. baseline ویندوز ساخته یا commit نمی‌شود.

`apps/web/AGENTS.md` را Next 16 هنگام dev می‌سازد و اگر حذف شود دوباره نوشته می‌شود.

## Brand assets

لوگوی PNG را در `apps/web/public/brand/directora-logo.png` بگذارید. تا وقتی فایل نباشد، صفحه wordmark متنی نشان می‌دهد. در تم تیره لوگو روی پلاک سفید می‌آید.

## How to start

شروع یعنی خواندن [معرفی](docs/00-project-overview.md)، [محدوده](docs/01-product-scope.md)، [محدودیت API](docs/03-instagram-api-constraints.md)، [تصمیم‌های معماری](docs/04-architecture-decisions.md)، [نقشه‌ی راه](docs/05-roadmap.md)، [سیستم طراحی](docs/09-design-system.md) و [طراحی دیتابیس](docs/10-database.md).

## Project root

Root کامل این است:

`D:\had va bz1 bz2\bz50Instagram Automation SaaS Platform\Instagram Automation SaaS Platform`

پوشه‌ی والد (`D:\had va bz1 bz2\bz50Instagram Automation SaaS Platform`) فقط پوشه‌ی نگه‌دارنده است و جزو مخزن نیست. هیچ فایلی در پوشه‌ی والد ساخته، تغییر، یا حذف نمی‌شود.

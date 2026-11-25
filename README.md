# [PRODUCT_NAME]

وضعیت سند: پیش‌نویس فاز ۱الف

تاریخ: 1405/09/05

## Summary

[PRODUCT_NAME] یک SaaS چندمستأجره برای اتوماسیون رسمی اینستاگرام کسب‌وکارهای ایرانی است. نام تجاری نهایی هنوز انتخاب نشده است.

## Status

`Phase 1A — Stack & design foundation decided, no application code yet`

تصمیم‌های Stack و سیستم طراحی ثبت شده‌اند. کد اپلیکیشن هنوز وجود ندارد.

## Tech stack (accepted)

- [ADR-001](docs/04-architecture-decisions.md): `TypeScript`، `Next.js`، `Node.js`، `pnpm`، `Prisma`، `zod`، و ابزار تست و کیفیت کد.
- [ADR-002](docs/04-architecture-decisions.md): `PostgreSQL` با یک schema مشترک و ستون `workspace_id`، به‌علاوه‌ی Row-Level Security.
- [ADR-003](docs/04-architecture-decisions.md): `BullMQ` روی `Redis` و worker جدا.
- [ADR-012](docs/04-architecture-decisions.md): monorepo با `pnpm` workspaces و `Turborepo`.
- [ADR-015](docs/04-architecture-decisions.md): `Tailwind CSS` 4، الگوی `shadcn/ui`، و سیستم طراحی.

این ADRها تا بازبینی ناظر در نقشه‌ی راه `نیازمند بررسی` هستند. ADR-004 تا ADR-011 و ADR-013 و ADR-014 هنوز `Proposed`اند.

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
│     └─ 06-ui-ux.mdc
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
│  └─ 09-design-system.md
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

## Collaboration

مالک محصول (Mamal) تسک را تعریف می‌کند. ناظر فنی (ATLAS) تحلیل می‌کند و پرامپت می‌نویسد. مجری (Cursor) اجرا و گزارش می‌دهد. ATLAS خروجی را با فایل‌های واقعی تطبیق می‌دهد و تأیید یا پرامپت اصلاحی صادر می‌کند. سپس نقشه‌ی راه به‌روز می‌شود.

## How to start

در این فاز دستور نصب وجود ندارد. اسکلت پروژه در تسک بعدی (01b) ساخته می‌شود. تا آن تسک، `package.json`، پوشه‌ی `apps/` و پوشه‌ی `packages/` ساخته نمی‌شوند.

شروع یعنی خواندن [معرفی](docs/00-project-overview.md)، [محدوده](docs/01-product-scope.md)، [محدودیت API](docs/03-instagram-api-constraints.md)، [تصمیم‌های معماری](docs/04-architecture-decisions.md)، [نقشه‌ی راه](docs/05-roadmap.md) و [سیستم طراحی](docs/09-design-system.md).

## Project root

Root کامل این است:

`D:\had va bz1 bz2\bz50Instagram Automation SaaS Platform\Instagram Automation SaaS Platform`

پوشه‌ی والد (`D:\had va bz1 bz2\bz50Instagram Automation SaaS Platform`) فقط پوشه‌ی نگه‌دارنده است و جزو مخزن نیست. هیچ فایلی در پوشه‌ی والد ساخته، تغییر، یا حذف نمی‌شود.

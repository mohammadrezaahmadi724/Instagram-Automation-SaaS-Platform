# [PRODUCT_NAME]

وضعیت سند: پیش‌نویس فاز ۰

تاریخ: 1405/09/04

## Summary

[PRODUCT_NAME] یک SaaS چندمستأجره برای اتوماسیون رسمی اینستاگرام کسب‌وکارهای ایرانی است. نام تجاری نهایی هنوز انتخاب نشده است.

## Status

`Phase 0 — Foundation, no application code yet`

Stack انتخاب نشده و کد اپلیکیشن وجود ندارد. ثبت این وضعیت: [ADR-000](docs/04-architecture-decisions.md).

## Key principles

1. فقط API رسمی Meta مجاز است و رمز اینستاگرام هرگز گرفته یا ذخیره نمی‌شود.
2. هیچ دکمه یا قابلیت نمایشی بدون عملکرد واقعی ساخته نمی‌شود.
3. هر مرحله قابل تست و تأیید است.
4. امنیت در اولویت است و معماری بدون ADR تغییر نمی‌کند. بازنویسی کامل بدون دلیل فنی جدی ممنوع است.
5. این پروژه از سایت‌ها و پروژه‌های دیگر مالک جداست.

بیان کامل اصول در [docs/00-project-overview.md](docs/00-project-overview.md) است.

## Repository layout

```
bz50Instagram Automation SaaS Platform/
├─ Instagram Automation SaaS Platform/   (empty nested folder, untouched)
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
│  └─ 08-glossary.md
├─ .env.example
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

## Collaboration

مالک محصول (Mamal) تسک را تعریف می‌کند. ناظر فنی (ATLAS) تحلیل می‌کند و پرامپت می‌نویسد. مجری (Cursor) اجرا و گزارش می‌دهد. ATLAS خروجی را با فایل‌های واقعی تطبیق می‌دهد و تأیید یا پرامپت اصلاحی صادر می‌کند. سپس نقشه‌ی راه به‌روز می‌شود.

## How to start

در این فاز دستور نصب وجود ندارد. Stack هنوز انتخاب نشده است. شروع یعنی خواندن سندهای پوشه‌ی `docs/`، به‌ترتیب معرفی، محدوده‌ی محصول، محدودیت‌های API، تصمیم‌های معماری و نقشه‌ی راه.

تا وقتی ADR مربوطه وضعیت `Accepted` نگرفته، کد اپلیکیشن، فایل پکیج، فریم‌ورک یا پوشه‌ی `src/` اضافه نمی‌شود.

## Nested folder

Root قطعی پروژه همین پوشه‌ی بیرونی است. پوشه‌ی تودرتوی `Instagram Automation SaaS Platform` اضافی است و بعد از تأیید مالک باید حذف شود. تا آن زمان دست‌نخورده می‌ماند و چیزی داخلش ساخته نمی‌شود. چون خالی است، Git آن را نشان نمی‌دهد.

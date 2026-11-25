# Changelog

وضعیت سند: پیش‌نویس فاز ۱الف

تاریخ: 1405/09/05

قالب این فایل Keep a Changelog است.

## [0.1.0-phase1a] - 1405/09/05

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

- Root در قانون پروژه و README دیگر پوشه‌ی والد نیست.
- مسیر Root در قانون پروژه و README با محل واقعی مخزن یکی شد. پوشه‌ی والد فقط نگه‌دارنده است.
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

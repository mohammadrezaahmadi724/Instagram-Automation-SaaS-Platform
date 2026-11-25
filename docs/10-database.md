# طراحی دیتابیس

وضعیت سند: پیش‌نویس فاز ۱ب

تاریخ: 1405/09/04

این سند schema اولیه‌ی اسکلت و طرح Row-Level Security برای فاز ۳ است. در این تسک policy ساخته نمی‌شود.

## 1. موجودیت‌ها

```
Workspace 1 ── * Membership * ── 1 User
```

- `workspaces`: خود Workspace همان tenant است. `id` از نوع uuid نسخه‌ی ۷، `name`، `slug` یکتا، `created_at` و `updated_at`.
- `users`: `phone_e164` یکتا با شکل `+98…`، و `display_name` اختیاری. هیچ فیلد رمز عبور، و هیچ فیلدی برای رمز اینستاگرام، وجود ندارد (SEC-001).
- `memberships`: عضویت یک کاربر در یک Workspace با نقش `OWNER`، `ADMIN`، `AGENT` یا `VIEWER`. یکتا روی `(workspace_id, user_id)` و ایندکس روی `workspace_id`.

نام جدول‌ها و ستون‌ها snake_case است. زمان‌ها `timestamptz` هستند.

`phone_e164` اینجاست چون هر روش ورود به یک شماره نیاز دارد. روش ورود MVP هنوز تصمیم‌گیری نشده است (ADR-009). اگر مالک روش دیگری انتخاب کند، با migration جدید تغییر می‌کند.

## 2. قاعده‌ی tenant

هر جدول tenant-owned ستون `workspace_id` دارد. `users` در این schema سراسری است، چون یک شخص می‌تواند در چند Workspace عضو باشد. تعلق به tenant از `memberships.workspace_id` می‌آید. جدول‌های بعدیِ محصول، مثل گفتگو و اتوماسیون، خودشان `workspace_id` دارند.

## 3. طرح RLS برای فاز ۳

فقط سند است. در این تسک policy، role، یا `set_config` پیاده‌سازی نمی‌شود.

- دو role: `directora_migrator` مالک جدول‌ها است و migration را اجرا می‌کند. `directora_app` بدون `BYPASSRLS` و بدون ownership است و برنامه‌ی وب با آن وصل می‌شود.
- روی جدول‌های tenant-owned هر دو `ENABLE ROW LEVEL SECURITY` و `FORCE ROW LEVEL SECURITY` اعمال می‌شود. FORCE باعث می‌شود مالک جدول هم از policy رد شود.
- policy بر اساس `current_setting('app.workspace_id', true)::uuid` است. آرگومان `true` یعنی اگر مقدار غایب باشد خطا ندهد و null برگردد، و آنگاه policy هیچ ردیفی را برنگرداند.
- مقدار با `set_config('app.workspace_id', $1, true)` داخل همان تراکنش Prisma (`$transaction`) و قبل از هر query تنظیم می‌شود. آرگومان سوم `true` یعنی مقدار فقط تا پایان همان تراکنش زنده است.
- تست نشت: دو Workspace ساخته می‌شود. با `workspace_id` اول، خواندن ردیف‌های Workspace دوم باید ۰ ردیف برگرداند، و برعکس.
- ریسک connection pooling: اگر `set_config` به session بچسبد (`is_local = false`)، اتصال به pool برمی‌گردد و tenant بعدی همان مقدار را می‌بیند. برای همین مقدار باید محلیِ تراکنش باشد.

## 4. پول

پیشنهاد ATLAS: مبلغ به صورت عدد صحیح به ریال ذخیره شود و فقط در UI به تومان تبدیل شود. این پیشنهاد نیازمند تأیید مالک است. `formatToman` تومانِ صحیح می‌گیرد و مبلغ منفی را نمی‌پذیرد.

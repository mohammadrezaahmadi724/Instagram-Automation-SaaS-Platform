# طراحی دیتابیس

وضعیت سند: پیش‌نویس فاز ۱ب

تاریخ: 1405/09/04

این سند schema اولیه‌ی اسکلت و طرح Row-Level Security برای فاز ۳ است. در این تسک policy ساخته نمی‌شود.

## 1. موجودیت‌ها

```
User 1 ── * Session * ── 0..1 Workspace
User 1 ── * Membership * ── 1 Workspace
Workspace 1 ── * InstagramAccount 1 ── * AutomationRule
Workspace 1 ── * Subscription * ── 1 Plan
Workspace 1 ── * PaymentReceipt * ── 1 Plan
OtpCode  (بدون tenant، قبل از ورود)
DataDeletionRequest  (بدون tenant، callback حذف دادهٔ Meta)
WebhookEvent و AutomationLog به Workspace وصل می‌شوند
```

- `workspaces`: خود Workspace همان tenant است. `id` از نوع uuid نسخه‌ی ۷، `name`، `slug` یکتا، `created_at` و `updated_at`.
- `users`: `phone_e164` یکتا با شکل `+98…`، و `display_name` اختیاری. هیچ فیلد رمز عبور، و هیچ فیلدی برای رمز اینستاگرام، وجود ندارد (SEC-001).
- `memberships`: عضویت یک کاربر در یک Workspace با نقش `OWNER`، `ADMIN`، `AGENT` یا `VIEWER`. یکتا روی `(workspace_id, user_id)` و ایندکس روی `workspace_id`. هر دو کلید خارجی `ON DELETE RESTRICT` هستند: حذف Workspace یا User تا وقتی عضویت دارد رد می‌شود، تا ردیف عضویت یتیم نشود. حذف عضویت باید صریح و قبل از حذف طرفین باشد.

نام جدول‌ها و ستون‌ها snake_case است. زمان‌ها `timestamptz` هستند.

`phone_e164` شکل `+989xxxxxxxxx` است. ورود MVP فقط OTP موبایل است (ADR-009، Accepted در ۱۴۰۵/۰۹/۰۶). `users.is_super_admin` برای پنل Super Admin پرامپت بعدی است و در این فاز UI یا API ندارد.

- `sessions`: توکن خام ذخیره نمی‌شود. `token_hash` یکتا است. حذف User این ردیف‌ها را CASCADE می‌کند، چون نشست بدون کاربر معنی ندارد. `active_workspace_id` با `ON DELETE SET NULL` است تا حذف Workspace نشست را نابود نکند؛ عضویت همیشه در کد چک می‌شود.
- `otp_codes`: قبل از ورود ساخته می‌شود و tenant نیست. `code_hash` با pepper است. plaintext ذخیره نمی‌شود. ایندکس `(phone_e164, created_at)` و `(phone_e164, consumed_at)`.
- `instagram_accounts`: فقط فیلدهای API رسمی Meta. رمز عبور اینستاگرام وجود ندارد. `followers_count` برای تطبیق با سقف پلن در پرامپت‌های بعد است. یکتا روی `(workspace_id, ig_user_id)`. ciphertext توکن کنار `token_key_id` می‌ماند (ADR-011).
- `automation_rules` و `automation_logs` و `webhook_events`: `webhook_events.external_event_id` یکتا است تا رویداد تکراری دو بار پردازش نشود. وضعیت لاگ `SKIPPED_PLAN_LIMIT` هم دارد. لاگ ایندکس `(workspace_id, created_at)` دارد.
- `data_deletion_requests`: درخواست حذف دادهٔ Meta. `confirmation_code` یکتا است. این جدول tenant نیست و شناسهٔ اینستاگرام را در صفحهٔ وضعیت نشان نمی‌دهد.
- `plans`: کد یکتا. `price_rial` از نوع `BigInt`. `min_followers` / `max_followers` سقف دنبال‌کننده است و `null` یعنی نامحدود. `features_json` فلگ ماژول‌های افزودنی است و در این فاز فقط seed می‌شود. مدیریت این ردیف‌ها با Super Admin در پرامپت پرداخت است.
- `subscriptions` و `payment_receipts`: اسکلت اشتراک و فیش. آپلود فیش و تأیید در این فاز نیست.

بقیه‌ی کلیدهای خارجی `ON DELETE RESTRICT` هستند. RLS همچنان فقط طرح فاز ۳ است و در این تسک policy ساخته نمی‌شود.

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

ذخیره‌ی مبلغ به‌صورت عدد صحیح ریال (`BigInt`) در ۱۴۰۵/۰۹/۰۶ تأیید و Accepted شد. نمایش در UI به تومان است. `formatToman` تومانِ صحیح می‌گیرد و مبلغ منفی را نمی‌پذیرد. `formatRialAsToman` ریال را بر ۱۰ تقسیم می‌کند و به `formatToman` می‌دهد. اگر ریال بر ۱۰ بخش‌پذیر نباشد، هلپر خطا می‌دهد.

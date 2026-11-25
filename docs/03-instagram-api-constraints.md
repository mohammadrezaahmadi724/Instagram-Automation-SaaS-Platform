# محدودیت‌های API اینستاگرام

وضعیت سند: پیش‌نویس فاز ۱الف

تاریخ: 1405/09/05

این سند بازنویسی پیوست محدودیت‌های رسمی همین تسک است. در این فاز درخواستی به مستندات Meta، اینستاگرام، یا دامنه‌های رقیب زده نشده است. هر بند لینک منبعی را دارد که در همان پیوست آمده است.

برچسب **تأییدنشده** یعنی منبع همین فاز آن را قطعی نکرده است. برچسب **استنباطی** یعنی نتیجه از بندهای همین سند گرفته شده، نه نقل مستقیم یک صفحه.

<a id="s1"></a>
## 1. نوع حساب

فقط حساب Professional (Business/Creator) پشتیبانی می‌شود. حساب شخصی پشتیبانی نمی‌شود.

منبع: [Instagram Platform Overview](https://developers.facebook.com/documentation/instagram-platform/overview/)

<a id="s2"></a>
## 2. مدل‌های اتصال

- Unified Login برای یکپارچه‌سازی جدید توصیه شده است. از `graph.facebook.com` استفاده می‌کند، توکن Business Integration System User می‌دهد، و به Page نیاز ندارد.
- Instagram Login از `graph.instagram.com` استفاده می‌کند، Instagram User token می‌دهد، و به Page نیاز ندارد.
- Facebook Login به Page نیاز دارد و پیام‌رسانی‌اش از طریق Messenger Platform است.
- یک اپ نمی‌تواند هم‌زمان Facebook Login و Instagram Login داشته باشد.

توصیه‌ی Meta تصمیم محصول ما نیست. انتخاب در ADR-005 باز است.

منابع: [Instagram Platform Overview](https://developers.facebook.com/documentation/instagram-platform/overview/) و [App Review](https://developers.facebook.com/docs/instagram-platform/app-review)

<a id="s3"></a>
## 3. مجوزها

مجوزهای Instagram Login:

- `instagram_business_basic`
- `instagram_business_manage_messages`
- `instagram_business_manage_comments`
- `instagram_business_content_publish`
- `instagram_business_manage_insights`

معادل‌ها در Facebook Login و Unified Login شامل `instagram_basic`، `instagram_manage_messages`، `instagram_manage_comments` و موارد مشابه است. scopeهای قدیمی `business_*` از ۲۷ ژانویه ۲۰۲۵ منسوخ شده‌اند.

درخواست `instagram_business_manage_messages` قابلیت Human Agent را خودکار به App Review اضافه می‌کند.

منبع: [Business Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login)

<a id="s4"></a>
## 4. سطح دسترسی

Standard Access فقط برای نقش‌داران اپ کافی است. کاربران واقعی به Advanced Access، App Review و Business Verification نیاز دارند. webhook زنده و Human Agent بدون Advanced Access کار نمی‌کنند.

منابع: [App Review](https://developers.facebook.com/docs/instagram-platform/app-review) و [Webhooks for Instagram](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-instagram/)

<a id="s5"></a>
## 5. Webhookها

فیلدها: `messages`، `messaging_postbacks`، `messaging_referral`، `messaging_seen`، `message_reactions`، `messaging_optins`، `comments`، `live_comments`، و در Unified Login همچنین `mentions`.

ریپلای استوری داخل `messages` با `reply_to.story` می‌آید. فیلد جداگانه‌ی `story_mentions` وجود ندارد.

نام دقیق بعضی فیلدها بین سندها اختلاف دارد (`message_reactions` / `messaging_reactions`). این اختلاف **تأییدنشده** است و در بخش ۱۶ آمده است.

منابع: [Webhook fields](https://developers.facebook.com/documentation/instagram-platform/webhooks/fields) و [Instagram webhooks reference](https://developers.facebook.com/docs/graph-api/webhooks/reference/instagram/)

<a id="s6"></a>
## 6. Send API

ارسال فقط بعد از پیام کاربر و داخل پنجره مجاز است.

- متن تا ۱۰۰۰ بایت
- تصویر png/jpeg تا 8MB و حداکثر ۱۰ تصویر
- ویدیو تا 25MB
- صوت تا 25MB
- PDF تا 25MB
- استیکر، واکنش، `MEDIA_SHARE` (فقط پست متعلق به خود حساب)، و `reply_to.mid`
- پیام گروهی پشتیبانی نمی‌شود

منبع: [Messaging API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api)

<a id="s7"></a>
## 7. قالب‌ها

- Generic Template: حداکثر ۱۰ کارت، ۳ دکمه‌ی `postback` یا `web_url`، عنوان ۸۰ کاراکتر، روی دسکتاپ نیست.
- Button Template: متن ۶۴۰ کاراکتر و ۱ تا ۳ دکمه.
- Quick Replies: حداکثر ۱۳ مورد متنی، ۲۰ کاراکتر. Quick Reply تلفن و ایمیل برای اینستاگرام غیرفعال است.
- Ice Breakers: حداکثر ۴ مورد، روی دسکتاپ نیست.
- Persistent Menu: `postback` یا `web_url`، به‌روزرسانی لحظه‌ای ندارد، حداکثر ۵ آیتم توصیه می‌شود.

منبع: [Messaging API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api)، زیربخش‌های `generic-template`، `button-template`، `quick-replies`، `ice-breakers` و `persistent-menu`. مسیر URL دقیق هر زیربخش در پیوست نیامده و اینجا ساخته نشده است.

<a id="s8"></a>
## 8. کامنت

- پاسخ عمومی: `POST /{ig-comment-id}/replies`
- مخفی کردن: `?hide=true`
- حذف: `DELETE`

پیوست، جمله‌ی «کامنت لایو پشتیبانی نمی‌شود» را بلافاصله پس از حذف با `DELETE` آورده است. اینکه این قید فقط حذف است یا هر سه عملیات، در همان جمله تفکیک نشده و **تأییدنشده** است.

منبع: [Comment Moderation](https://developers.facebook.com/docs/instagram-platform/comment-moderation)

<a id="s9"></a>
## 9. پنجره‌ی پیام و HUMAN_AGENT

پنجره‌ی استاندارد ۲۴ ساعت است. برای اولین پیام از تبلیغ Click-to-Direct تا ۷ روز است.

تگ `HUMAN_AGENT` تا ۷ روز اعتبار دارد و تنها تگ مجاز در اینستاگرام است. فقط برای پاسخ عامل انسانی است. استفاده‌ی تبلیغاتی ممنوع است. اگر قانون افشای بات را بخواهد، افشا لازم است.

منابع: [Page messages](https://developers.facebook.com/docs/graph-api/reference/page/messages/)، [Human Agent](https://developers.facebook.com/docs/features-reference/human-agent/) و [Developer Policies](https://developers.facebook.com/devpolicy/)

<a id="s10"></a>
## 10. Private Reply

- فقط یک پیام برای هر کامنت
- پست، ریل و تبلیغ تا ۷ روز
- لایو فقط حین پخش
- اگر کاربر فالو نکرده باشد، پیام به Requests می‌رود
- ادامه‌ی گفتگو فقط بعد از پاسخ کاربر ممکن است
- ارسال با `POST /{IG_ID}/messages` و `recipient.comment_id`

منبع: [Private Replies](https://developers.facebook.com/documentation/instagram-platform/private-replies)

<a id="s11"></a>
## 11. Rate limit

- Conversations API: ۲ درخواست در ثانیه
- Private Reply لایو: ۱۰۰ در ثانیه
- Private Reply پست و ریل: ۷۵۰ در ساعت
- Send API متن: ۱۰۰ در ثانیه
- صوت و ویدیو: ۱۰ در ثانیه
- پلتفرم: `4800 × impressions` در ۲۴ ساعت

ادعای «۲۰۰ دایرکت در ساعت» **تأییدنشده** است و مبنای طراحی نیست.

منابع: [Instagram Platform Overview](https://developers.facebook.com/documentation/instagram-platform/overview/) و [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)

<a id="s12"></a>
## 12. توکن‌ها

- کد مجوز: ۱ ساعت
- توکن کوتاه‌مدت: ۱ ساعت
- در Instagram API with Instagram Login، refresh token جداگانه وجود ندارد. توکن short-lived با `ig_exchange_token` به توکن long-lived شصت‌روزه تبدیل می‌شود.
- خود همان توکن long-lived با `ig_refresh_token` تمدید می‌شود، به این شرط که دست‌کم ۲۴ ساعت از صدورش گذشته و منقضی نشده باشد.
- توکن منقضی دوباره تمدید نمی‌شود
- در Facebook Login، Page token که از long-lived user token ساخته شود انقضا ندارد
- در Unified Login، توکن Business Integration System User با API مدیریت می‌شود

منابع: [Business Login](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) و [Long-lived tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived)

<a id="s13"></a>
## 13. موارد پشتیبانی‌نشده

- حساب شخصی
- Cold DM
- پیام انبوه به کسانی که تعامل نکرده‌اند
- پیام گروهی
- لیست فالوور (حذف‌شده از ۲۰۱۸)
- فالو و آنفالو خودکار
- پوشه‌های Inbox (Primary / General / Requests)
- تگ‌های Messenger به‌جز `HUMAN_AGENT`

پروفایل کاربر فقط بعد از رضایت در دسترس است. رضایت در منبع یعنی پیام کاربر، یا کلیک روی Ice Breaker، یا کلیک روی منو.

فالو اجباری در ردیف ممنوع پیوست قابلیت‌ها با وضعیت `not-allowed` آمده است. API رسمی آن را به‌عنوان قابلیت پشتیبانی‌شده نام نبرده است.

منابع: [Messaging API](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api)، [Instagram Graph API updates (2018)](https://developers.facebook.com/blog/post/2018/01/30/instagram-graph-api-updates/) و [Developer Policies](https://developers.facebook.com/devpolicy/)

<a id="s14"></a>
## 14. Data Deletion و Deauthorize

هر دو URL در تنظیمات Business Login ثبت می‌شوند.

Data Deletion یک `POST` با `signed_request` است. پاسخ JSON باید `url` و `confirmation_code` داشته باشد.

جزئیات payload مربوط به Deauthorize **تأییدنشده** است.

منابع: [Data Deletion Callback](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback) و [Instagram APIs app type](https://developers.facebook.com/docs/development/create-an-app/other-app-types/instagram-apis/)

<a id="s15"></a>
## 15. ایران و تحریم

**تأییدنشده.** در سندهای بررسی‌شده متنی درباره‌ی ایران پیدا نشد. Business Verification برای شرکت ایرانی، و دسترسی از سرور ایران، تأییدنشده است و به بررسی حقوقی نیاز دارد. این ریسک بحرانی است.

> TODO(research): بررسی حقوقی Business Verification برای شرکت ایرانی، و دسترسی سرور مستقر در ایران به Graph API و webhook.

منبع جداگانه‌ای در پیوست برای این بند نیست، چون در سندهای بررسی‌شده متنی یافت نشده است.

<a id="s16"></a>
## 16. اختلاف سندها

این موارد **تأییدنشده**‌اند و تا بازبینی هنگام پیاده‌سازی نباید قطعی فرض شوند.

> TODO(research): چهار اختلاف زیر باز است.
>
> 1. نام فیلد webhook: `message_reactions` یا `messaging_reactions`.
> 2. نیاز Facebook Login به مجوز `pages_messaging`.
> 3. نیاز Private Reply در Instagram Login به مجوز messages.
> 4. وجود Marketing Messages برای Instagram DM.

<a id="s17"></a>
## 17. پیامدها برای طراحی محصول

بندهای این بخش **استنباطی**‌اند: نتیجه‌ی طراحی از محدودیت‌های بالا، نه قابلیت جدید.

- اتصال فقط برای حساب Professional طراحی می‌شود. مسیر حساب شخصی ساخته نمی‌شود.
- مدل ورود به Meta تا ADR-005 باز می‌ماند. ترکیب Facebook Login و Instagram Login در یک اپ در گزینه‌ها نمی‌آید.
- کاربر واقعی، webhook زنده، و Human Agent به Advanced Access و App Review وابسته‌اند. Business Verification هم در منبع برای کاربران واقعی آمده است.
- ریپلای استوری از روی `messages` و `reply_to.story` مدل می‌شود، نه از یک فیلد `story_mentions`.
- ارسال باید سقف Send API را در محصول رعایت کند: متن ۱۰۰۰ بایت، عکس ۸ مگابایت، ویدیو و صوت و PDF تا ۲۵ مگابایت.
- Inbox باید پنجره‌ی ۲۴ ساعت را نشان دهد. `HUMAN_AGENT` فقط مسیر پاسخ انسانی است.
- Comment-to-DM حداکثر یک Private Reply برای هر کامنت است و برای لایو فقط حین پخش ممکن است.
- rate limitها صف، backoff، و پاسخ سریع webhook را لازم می‌کنند. عدد «۲۰۰ دایرکت در ساعت» استفاده نمی‌شود.
- توکن long-lived با job تمدید می‌شود: تبدیل short-lived با `ig_exchange_token`، و تمدید خود همان توکن با `ig_refresh_token` فقط بعد از ۲۴ ساعت و قبل از انقضا. refresh token جداگانه وجود ندارد. توکن منقضی قابل تمدید نیست.
- Data Deletion و Deauthorize از MVP هستند، نه قابلیت بعدی.
- موارد بخش ۱۳ و ردیف `F-NEVER` وارد نقشه‌ی قابلیت نمی‌شوند.
- محل سرور تا وقتی دسترسی پایدار به `graph.instagram.com` و `graph.facebook.com` و HTTPS عمومی webhook روشن نشود، تصمیم بسته است. خود این دسترسی برای ایران تأییدنشده است.
- اختلاف‌های بخش ۱۶ در پیاده‌سازی باید با سند رسمی همان روز دوباره خوانده شوند.

import { dataDeletionStatus } from '../../../../../src/instagram/gateway';

const labels = { RECEIVED: 'درخواست دریافت شد', COMPLETED: 'داده‌های مرتبط حذف یا بی‌نام شد' };

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const status = await dataDeletionStatus(code);
  if (!status) return new Response('درخواستی با این کد پیدا نشد.', { status: 404 });
  const label = status === 'COMPLETED' ? labels.COMPLETED : labels.RECEIVED;
  const body = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>وضعیت حذف داده</title><body><h1>وضعیت حذف داده</h1><p>${label}</p><p>کد پیگیری در این صفحه نمایش داده نمی‌شود تا دادهٔ شخصی فاش نشود.</p></body></html>`;
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

import { randomInt } from 'node:crypto';
import { expect, type Page } from '@playwright/test';

export async function loginWithOtp(page: Page) {
  const phone = `0912${randomInt(0, 10_000_000).toString().padStart(7, '0')}`;
  const ip = `203.0.113.${randomInt(1, 200)}`;
  await page.route('**/api/auth/otp/request', async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'x-directora-test-ip': ip,
      },
    });
  });
  await page.goto('/login');
  await page.getByLabel('شماره موبایل').fill(phone);
  await page.getByRole('button', { name: 'ارسال کد' }).click();
  await expect(page.getByLabel('کد شش‌رقمی')).toBeVisible();
  const helper = await page.request.get(
    `/api/auth/otp/test-code?phone=${encodeURIComponent(phone)}`,
  );
  expect(helper.status()).toBe(200);
  const payload = (await helper.json()) as { code: string };
  await page.getByLabel('کد شش‌رقمی').fill(payload.code);
  await page.getByRole('button', { name: 'ورود' }).click();
  await expect(page).toHaveURL(/\/app$/, { timeout: 45_000 });
}

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { getPrisma } from '@directora/db';
import { expect, test, type Page } from '@playwright/test';
import { loginWithOtp } from './login';

try {
  process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env'));
} catch {
  // The e2e environment may already provide DATABASE_URL.
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (item) => item.impact === 'serious' || item.impact === 'critical',
  );
  expect(blocking).toEqual([]);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}`, fullPage: true });
}

test('landing, receipt, help and admin approval', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'تعرفه‌ها' })).toBeVisible();
  await expect(page.getByText('رشد').first()).toBeVisible();
  await expect(page.getByText('حرفه‌ای').first()).toBeVisible();
  await axe(page);
  await shot(page, 'landing-1440-light.png');
  await page.getByRole('button', { name: 'تیره' }).click();
  await axe(page);
  await shot(page, 'landing-1440-dark.png');
  await page.getByRole('button', { name: 'روشن' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, 'landing-390-light.png');
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const route of ['/privacy', '/terms', '/data-deletion', '/contact']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
  }

  const phone = await loginWithOtp(page);
  await page.goto('/admin');
  await expect(page.getByText('اجازه ورود به پنل مدیریت را ندارید')).toBeVisible();

  await page.goto('/app/billing');
  await page.getByRole('button', { name: 'پرداخت کارت‌به‌کارت' }).first().click();
  await page.getByLabel('شماره پیگیری').fill('E2E12345');
  await page.getByRole('button', { name: 'ثبت فیش' }).click();
  await expect(page.getByText('در انتظار بررسی').first()).toBeVisible();
  await axe(page);
  await shot(page, 'billing-1440-light.png');
  await page.getByRole('button', { name: 'تیره' }).click();
  await axe(page);
  await page.getByRole('button', { name: 'روشن' }).click();

  await page.goto('/app/help');
  await expect(page.getByRole('heading', { name: 'شروع کار' })).toBeVisible();
  await axe(page);
  await shot(page, 'help-1440-light.png');
  await page.getByRole('button', { name: 'تیره' }).click();
  await axe(page);
  await page.getByRole('button', { name: 'روشن' }).click();

  const databaseUrl = process.env.DATABASE_URL;
  expect(databaseUrl).toBeTruthy();
  const database = getPrisma(databaseUrl ?? '');
  await database.user.update({
    where: { phoneE164: `+98${phone.slice(1)}` },
    data: { isSuperAdmin: true },
  });

  await page.goto('/admin/receipts');
  await expect(page.getByText('E2E12345')).toBeVisible();
  await axe(page);
  await shot(page, 'admin-receipts-1440-light.png');
  await page.getByRole('button', { name: 'تیره' }).click();
  await axe(page);
  await page.getByRole('button', { name: 'روشن' }).click();
  await page.getByRole('button', { name: 'تأیید' }).click();
  await expect(page.getByText('فیش در انتظاری نیست')).toBeVisible();

  await page.goto('/admin/plans');
  await expect(page.getByText('حرفه‌ای').first()).toBeVisible();
  await page.goto('/app/billing');
  await expect(page.getByText('فعال').first()).toBeVisible();
});

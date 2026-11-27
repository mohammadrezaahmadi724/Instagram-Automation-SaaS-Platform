import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { loginWithOtp } from './login';

async function expectNoSeriousAxe(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (item) => item.impact === 'serious' || item.impact === 'critical',
  );
  expect(blocking).toEqual([]);
}

test('demo page, comment rule, webhook simulator and logs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginWithOtp(page);
  await page.goto('/app/instagram');
  await expectNoSeriousAxe(page);
  await page.screenshot({
    path: 'test-results/screenshots/instagram-1440-light.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'اتصال پیج آزمایشی (فقط محیط توسعه)' }).click();
  await expect(page.getByText('@directora_demo')).toBeVisible();

  await page.goto('/app/automations/new');
  await page.screenshot({
    path: 'test-results/screenshots/automation-new-1440-light.png',
    fullPage: true,
  });
  await page.getByLabel('نام دستور').fill('پاسخ قیمت');
  await page.getByRole('button', { name: 'ذخیرهٔ دستور' }).click();
  await expect(page).toHaveURL(/\/app\/automations$/);
  await page.screenshot({
    path: 'test-results/screenshots/automations-1440-light.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'تیره' }).click();
  await expectNoSeriousAxe(page);
  await page.screenshot({
    path: 'test-results/screenshots/automations-1440-dark.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'روشن' }).click();

  await page.goto('/app/instagram');
  await page.getByLabel('متن رویداد آزمایشی').fill('قیمت');
  await page.getByRole('button', { name: 'تریگر کامنت‌به‌دایرکت' }).click();
  await expect(page.getByText('رویداد به صف واقعی وب‌هوک رفت.')).toBeVisible();

  await expect
    .poll(
      async () => {
        await page.goto('/app/logs');
        return page.getByRole('cell', { name: 'پاسخ قیمت' }).count();
      },
      { timeout: 30_000 },
    )
    .toBeGreaterThan(0);
  await expect(page.getByRole('cell', { name: 'موفق' })).toBeVisible();
  await expectNoSeriousAxe(page);
  await page.screenshot({ path: 'test-results/screenshots/logs-1440-light.png', fullPage: true });
  await page.goto('/app');
  await expect(page.getByTestId('stat-card').filter({ hasText: 'دستورهای فعال' })).toContainText(
    '۱',
  );
  await expect(page.getByTestId('stat-card').filter({ hasText: 'پاسخ موفق ۳۰ روز' })).toContainText(
    '۱',
  );

  await page.goto('/app/automations');
  await page.getByRole('switch', { name: 'متوقف کردن دستور' }).click();
  await expect(page.getByRole('switch', { name: 'فعال کردن دستور' })).toBeVisible();
  await page.getByRole('button', { name: 'حذف' }).click();
  await page.getByTestId('confirm-dialog').getByRole('button', { name: 'حذف' }).click();
  await expect(page.getByText('هنوز دستوری نیست')).toBeVisible();

  await page.goto('/app/instagram');
  await page.getByRole('button', { name: 'تیره' }).click();
  await expectNoSeriousAxe(page);
  await page.goto('/app/logs');
  await page.getByRole('button', { name: 'تیره' }).click();
  await expectNoSeriousAxe(page);
});

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

test('login, settings, and logout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.context().clearCookies();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText('کد فقط برای ورود به دایرکتورا است.')).toBeVisible();
  await expectNoSeriousAxe(page);
  await page.screenshot({ path: 'test-results/screenshots/login-1440-light.png', fullPage: true });
  await page.getByRole('button', { name: 'تیره' }).click();
  await expectNoSeriousAxe(page);
  await page.screenshot({ path: 'test-results/screenshots/login-1440-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'روشن' }).click();

  await loginWithOtp(page);
  await expect(page.getByRole('heading', { name: 'فضای کاری من' })).toBeVisible();
  await expectNoSeriousAxe(page);
  await page.screenshot({
    path: 'test-results/screenshots/app-dashboard-1440-light.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'تیره' }).click();
  await expectNoSeriousAxe(page);
  await page.screenshot({
    path: 'test-results/screenshots/app-dashboard-1440-dark.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'روشن' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'test-results/screenshots/app-dashboard-390-light.png',
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/app/settings');
  const name = `فضای تست ${Date.now() % 10000}`;
  await page.getByLabel('نام فضای کاری').fill(name);
  await page.getByRole('button', { name: 'ذخیره فضای کاری' }).click();
  await expect(page.getByText('نام فضای کاری ذخیره شد')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('نام فضای کاری')).toHaveValue(name);
  await page.getByRole('button', { name: /0912/ }).click();
  await page.getByRole('menuitem', { name: 'خروج' }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
});

import { existsSync } from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { loginWithOtp } from './login';

const linuxBaseline = path.join(
  process.cwd(),
  'e2e',
  'smoke.spec.ts-snapshots',
  'sidebar-open-chromium-linux.png',
);
const runVisualSnapshots =
  process.platform === 'linux' &&
  (process.env.UPDATE_SNAPSHOTS === '1' || existsSync(linuxBaseline));

async function expectNoSeriousAxe(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (item) => item.impact === 'serious' || item.impact === 'critical',
  );
  expect(blocking).toEqual([]);
}

async function expectNoPageScroll(page: Page) {
  const fits = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(fits).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('home, catalog and shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const theme = await page.getByRole('button', { name: 'تیره' }).boundingBox();
  expect(theme?.height ?? 0).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'پرش به محتوا' })).toBeFocused();
  await expectNoSeriousAxe(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/design');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const badge = page.getByTestId('badge-row').getByText('خنثی');
  const background = await badge.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(background).not.toBe('transparent');
  const toggle = await page.getByTestId('catalog-switch').boundingBox();
  expect(toggle?.height ?? 0).toBeGreaterThanOrEqual(44);
  await expect(page.getByText('غیرفعال').first()).toBeVisible();
  await expectNoSeriousAxe(page);
  await page.screenshot({ path: 'test-results/screenshots/design-1440-light.png', fullPage: true });
  await page.getByRole('button', { name: 'تیره' }).click();
  await page.screenshot({ path: 'test-results/screenshots/design-1440-dark.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/screenshots/design-390-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'روشن' }).click();
  await page.screenshot({ path: 'test-results/screenshots/design-390-light.png', fullPage: true });
  await page.setViewportSize({ width: 360, height: 800 });
  await expectNoPageScroll(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await loginWithOtp(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.getByRole('heading', { name: 'فضای کاری من' })).toBeVisible();
  await expect(page.getByText('اتصال رسمی Meta API در مرحلهٔ بعد فعال می‌شود.')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'پرش به محتوا' })).toBeFocused();
  const current = page.getByTestId('app-sidebar').getByRole('link', { name: 'داشبورد' });
  await current.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByTestId('app-sidebar').getByRole('link', { name: 'اینستاگرام' }),
  ).toBeFocused();
  await expectNoSeriousAxe(page);
  await page.screenshot({ path: 'test-results/screenshots/shell-1440-light.png', fullPage: true });
  await page.getByRole('button', { name: 'تیره' }).click();
  await page.screenshot({ path: 'test-results/screenshots/shell-1440-dark.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'باز کردن منو' }).click();
  await expect(page.getByRole('dialog', { name: 'منو' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/shell-390-dark.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'روشن' }).click();
  await page.getByRole('button', { name: 'باز کردن منو' }).click();
  await page.screenshot({ path: 'test-results/screenshots/shell-390-light.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 360, height: 800 });
  await expectNoPageScroll(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/design');
  await page.getByRole('button', { name: 'حذف نمونه' }).click();
  await expect(page.getByRole('button', { name: 'انصراف' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'حذف نمونه' })).toBeFocused();

  const health = await page.request.get('/api/health');
  expect(health.status()).toBe(200);

  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'این صفحه پیدا نشد' })).toBeVisible();
});

test('visual baselines on linux CI', async ({ page }) => {
  test.skip(
    !runVisualSnapshots,
    'linux visual baselines are not in the repo; on Linux set UPDATE_SNAPSHOTS=1 to create them',
  );
  await loginWithOtp(page);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect(page.getByTestId('app-sidebar')).toHaveScreenshot('sidebar-open.png');
  await page.getByRole('button', { name: 'جمع کردن منو' }).click();
  await expect(page.getByTestId('app-sidebar')).toHaveScreenshot('sidebar-collapsed.png');
  await expect(page.getByTestId('app-topbar')).toHaveScreenshot('topbar.png');
  await page.goto('/design');
  await expect(page.getByTestId('badge-row')).toHaveScreenshot('badges.png');
  await expect(page.getByTestId('form-error')).toHaveScreenshot('form-error.png');
  await expect(page.getByTestId('stat-card').first()).toHaveScreenshot('stat-card.png');
  await expect(page.getByTestId('data-table').first()).toHaveScreenshot('table-ready.png');
  await expect(page.getByTestId('table-loading')).toHaveScreenshot('table-loading.png');
  await expect(page.getByTestId('table-empty')).toHaveScreenshot('table-empty.png');
  await page.getByRole('button', { name: 'حذف نمونه' }).click();
  await expect(page.getByTestId('confirm-dialog')).toHaveScreenshot('confirm-dialog.png');
});

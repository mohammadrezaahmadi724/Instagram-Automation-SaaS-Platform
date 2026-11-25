import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function expectSolidBadge(page: import('@playwright/test').Page) {
  const background = await page
    .getByText('خنثی')
    .evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
  expect(background).not.toBe('transparent');
}

async function expectTouchHeight(page: import('@playwright/test').Page) {
  const theme = await page.getByRole('button', { name: 'تیره' }).boundingBox();
  const toggle = await page.getByRole('switch', { name: 'نمونه‌ی سوئیچ' }).boundingBox();
  expect(theme?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(toggle?.height ?? 0).toBeGreaterThanOrEqual(44);
}

async function expectNoSeriousAxe(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blocking = results.violations.filter(
    (item) => item.impact === 'serious' || item.impact === 'critical',
  );
  expect(blocking).toEqual([]);
}

test('design showcase', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1, name: 'دایرکتورا' })).toBeVisible();
  const fontReady = await page.evaluate(async () => {
    await document.fonts.load('16px Vazirmatn');
    return document.fonts.check('16px Vazirmatn');
  });
  expect(fontReady).toBe(true);

  await page.getByRole('button', { name: 'تیره' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expectNoSeriousAxe(page);
  await expectSolidBadge(page);
  await expectTouchHeight(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'test-results/screenshots/home-1440-dark.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/screenshots/home-390-dark.png', fullPage: true });

  await page.getByRole('button', { name: 'روشن' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expectNoSeriousAxe(page);
  await expectSolidBadge(page);
  await expectTouchHeight(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'test-results/screenshots/home-1440-light.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/screenshots/home-390-light.png', fullPage: true });

  await page.setViewportSize({ width: 360, height: 800 });
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(overflows).toBe(true);

  await page.getByRole('button', { name: 'نمایش پیام موفقیت' }).click();
  await expect(page.getByText('پیام نمونه نمایش داده شد')).toBeVisible();

  const health = await page.request.get('/api/health');
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ status: 'ok', service: 'web' });

  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'این صفحه پیدا نشد' })).toBeVisible();
});

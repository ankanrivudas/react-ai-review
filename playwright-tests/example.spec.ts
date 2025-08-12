import { test, expect } from '@playwright/test';

test('homepage shows title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toContainText('React AI Review Sample');
});

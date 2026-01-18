import { test, expect } from '@playwright/test';

test.describe('Smoke Test', () => {
  test('should load the home page and have the correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ThumbCode/);
  });
});

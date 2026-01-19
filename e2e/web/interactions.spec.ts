import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

test.describe('User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await disableAnimations(page);
  });

  test('should navigate to the GitHub repository when the "View on GitHub" button is clicked', async ({
    page,
  }) => {
    const pagePromise = page.context().waitForEvent('page');
    await page.getByRole('link', { name: /View on GitHub/i }).click();
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('github.com');
  });
});

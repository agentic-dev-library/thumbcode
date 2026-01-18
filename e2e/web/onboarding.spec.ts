import { test, expect } from '@playwright/test';
import { disableAnimations } from './utils/visual';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await disableAnimations(page);
  });

  test('should render the main app container', async ({ page }) => {
    const mainContainer = page.getByTestId('main-app-container');
    await expect(mainContainer).toBeVisible();
  });
});

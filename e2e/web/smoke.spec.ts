import { expect, test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the app', async ({ page }) => {
    await page.goto('/');
    // The root route renders a landing page or redirects to onboarding
    // Just verify the page loads without error
    await expect(page.getByText(/ThumbCode/i)).toBeVisible();
  });

  test('should display the ThumbCode logo and tagline', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    // Check for ThumbCode branding
    await expect(page.getByText('ThumbCode')).toBeVisible();
    await expect(page.getByText(/Code with your thumbs/i)).toBeVisible();
  });

  test('should have a Get Started button', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    const getStartedButton = page.getByText('Get Started');
    await expect(getStartedButton).toBeVisible();
  });
});

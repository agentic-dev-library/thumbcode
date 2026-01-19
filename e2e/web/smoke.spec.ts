import { expect, test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the app and redirect to welcome', async ({ page }) => {
    await page.goto('/');
    // Expo app redirects to /welcome for first-time users
    await expect(page).toHaveURL(/\/welcome/);
    // Title may be empty in Expo web, just check the URL redirect worked
  });

  test('should display the ThumbCode logo and tagline', async ({ page }) => {
    await page.goto('/welcome');
    // Check for ThumbCode branding
    await expect(page.getByText('ThumbCode')).toBeVisible();
    await expect(page.getByText(/Code with your thumbs/i)).toBeVisible();
  });

  test('should have a Get Started button', async ({ page }) => {
    await page.goto('/welcome');
    // React Native Pressable renders as generic element, not button role
    const getStartedButton = page.getByText('Get Started');
    await expect(getStartedButton).toBeVisible();
  });
});

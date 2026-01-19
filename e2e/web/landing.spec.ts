import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

test.describe('Welcome Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome');
    await disableAnimations(page);
  });

  test('should display ThumbCode branding correctly', async ({ page }) => {
    // Logo and title
    await expect(page.getByText('ThumbCode')).toBeVisible();

    // Tagline
    await expect(page.getByText(/Code with your thumbs/i)).toBeVisible();
    await expect(page.getByText(/Ship apps from your phone/i)).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    // All 4 feature cards should be visible
    const features = [
      'AI Agent Teams',
      'Mobile-First Git',
      'Your Keys, Your Control',
      'Zero Server Costs',
    ];

    for (const feature of features) {
      await expect(page.getByText(feature)).toBeVisible();
    }
  });

  test('should have Get Started button', async ({ page }) => {
    // React Native Pressable renders as generic element, not button role
    const button = page.getByText('Get Started');
    await expect(button).toBeVisible();
  });
});

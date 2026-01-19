import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await disableAnimations(page);
  });

  test('should match full page screenshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('landing-full-page.png');
  });

  test('should match hero section screenshot', async ({ page }) => {
    const hero = page.getByTestId('hero-section');
    await expect(hero).toHaveScreenshot('landing-hero-section.png');
  });

  test('should match feature cards screenshot', async ({ page }) => {
    const features = page.getByTestId('feature-cards');
    await expect(features).toHaveScreenshot('landing-feature-cards.png');
  });

  test('should match navigation elements screenshot', async ({ page }) => {
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toHaveScreenshot('landing-navbar.png');
  });
});

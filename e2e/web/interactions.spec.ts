import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

/**
 * Helper to click a Pressable element by text
 * Uses .first() and force click for reliability with React Native elements
 */
async function clickPressable(page: import('@playwright/test').Page, text: string | RegExp) {
  const element = page.getByText(text).first();
  await element.scrollIntoViewIfNeeded();
  await element.click({ force: true });
}

/**
 * Helper to complete onboarding and get to dashboard
 */
async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/welcome');
  await clickPressable(page, 'Get Started');
  await page.waitForTimeout(500);
  await clickPressable(page, 'Skip for Now');
  await page.waitForTimeout(500);
  await clickPressable(page, 'Skip for Now');
  await page.waitForTimeout(500);
  await clickPressable(page, 'Skip for Now');
  await page.waitForTimeout(500);
  await clickPressable(page, /Start Building/i);
  await page.waitForTimeout(500);
}

test.describe('User Interactions - Basic', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  test('should navigate to GitHub auth step', async ({ page }) => {
    await page.goto('/welcome');
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);
    await expect(page.getByText(/Connect GitHub|GitHub/i).first()).toBeVisible();
  });

  test('should show GitHub auth content', async ({ page }) => {
    await page.goto('/welcome');
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);
    await expect(page.getByText(/GitHub|Connect|Secure Device Flow/i).first()).toBeVisible();
  });

  test('should navigate to API provider step', async ({ page }) => {
    await page.goto('/welcome');
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await expect(page.getByText(/Anthropic|OpenAI|AI Provider/i).first()).toBeVisible();
  });
});

test.describe('User Interactions - Full Flow', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  test('should display project creation step', async ({ page }) => {
    await page.goto('/welcome');
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await expect(page.getByText(/Project|Repository|Create|Select/i).first()).toBeVisible();
  });

  test('should show completion screen', async ({ page }) => {
    await page.goto('/welcome');
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await expect(page.getByText(/All Set|Complete|Ready/i).first()).toBeVisible();
  });
});

test.describe('Dashboard Interactions', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await disableAnimations(page);
  });

  test('should display dashboard content', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should show agent team section', async ({ page }) => {
    await expect(page.getByText(/Agent|Team/i).first()).toBeVisible();
  });
});

test.describe('Agents Page Interactions', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await clickPressable(page, 'Agents');
    await page.waitForTimeout(500);
    await disableAnimations(page);
  });

  test('should display agents page', async ({ page }) => {
    await expect(page).toHaveURL(/\/agents/);
  });

  test('should show agent information', async ({ page }) => {
    const hasContent = await page
      .getByText(/Agent|Active|Tasks|Completed/i)
      .first()
      .isVisible();
    expect(hasContent).toBe(true);
  });
});

test.describe('Chat Page Interactions', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await clickPressable(page, 'Chat');
    await page.waitForTimeout(500);
    await disableAnimations(page);
  });

  test('should display chat page', async ({ page }) => {
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should show chat interface', async ({ page }) => {
    const hasInput = await page
      .getByPlaceholder(/Message|Type|Chat/i)
      .isVisible()
      .catch(() => false);
    const hasMessages = await page
      .getByText(/Architect|Implementer|Message/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasInput || hasMessages).toBe(true);
  });
});

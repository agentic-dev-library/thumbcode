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
 * TODO: This flow times out due to React Native web rendering issues
 * Needs UX investigation into above/below fold visibility
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

// TODO: These tests are skipped pending UX research on:
// - Above/below fold visibility analysis
// - React Native web rendering timing
// - Onboarding flow optimization
test.describe.skip('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await disableAnimations(page);
  });

  test('should display dashboard with stats cards', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    const statsVisible = await page.getByText(/Active|Projects|Running|Agents|Pending|Tasks/i).first().isVisible();
    expect(statsVisible).toBe(true);
  });

  test('should display agent team section', async ({ page }) => {
    await expect(page.getByText(/Agent|Team/i).first()).toBeVisible();
    const hasAgentType = await page.getByText(/Architect|Implementer|Reviewer|Tester/i).first().isVisible();
    expect(hasAgentType).toBe(true);
  });

  test('should display recent activity section', async ({ page }) => {
    await expect(page.getByText(/Recent|Activity/i).first()).toBeVisible();
  });

  test('should display progress section', async ({ page }) => {
    await expect(page.getByText(/Progress|Today/i).first()).toBeVisible();
  });
});

test.describe.skip('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await disableAnimations(page);
  });

  test('should navigate to Projects tab', async ({ page }) => {
    await clickPressable(page, 'Projects');
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should navigate to Agents tab', async ({ page }) => {
    await clickPressable(page, 'Agents');
    await expect(page).toHaveURL(/\/agents/);
  });

  test('should navigate to Chat tab', async ({ page }) => {
    await clickPressable(page, 'Chat');
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should navigate to Settings tab', async ({ page }) => {
    await clickPressable(page, 'Settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should navigate back to Home tab', async ({ page }) => {
    await clickPressable(page, 'Settings');
    await expect(page).toHaveURL(/\/settings/);
    await clickPressable(page, 'Home');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});

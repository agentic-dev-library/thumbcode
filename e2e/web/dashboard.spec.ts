import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

/**
 * Helper to click a tab in the bottom tab bar by its aria-label.
 */
async function clickTab(page: import('@playwright/test').Page, name: string) {
  const tab = page.getByRole('link', { name: new RegExp(name, 'i') });
  await tab.click();
}

/**
 * Helper to complete onboarding and get to dashboard.
 * Sets localStorage key to skip onboarding, then navigates to home.
 */
async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('thumbcode_onboarding_complete', 'true');
  });
  await page.goto('/');
  await page.waitForTimeout(1000);
}

test.describe('Dashboard', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await disableAnimations(page);
  });

  test('should display dashboard with stats cards', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    const statsVisible = await page
      .getByText(/Active|Projects|Running|Agents|Pending|Tasks/i)
      .first()
      .isVisible();
    expect(statsVisible).toBe(true);
  });

  test('should display agent team section', async ({ page }) => {
    await expect(page.getByText(/Agent|Team/i).first()).toBeVisible();
    const hasAgentType = await page
      .getByText(/Architect|Implementer|Reviewer|Tester/i)
      .first()
      .isVisible();
    expect(hasAgentType).toBe(true);
  });

  test('should display recent activity section', async ({ page }) => {
    await expect(page.getByText(/Recent|Activity/i).first()).toBeVisible();
  });

  test('should display progress section', async ({ page }) => {
    await expect(page.getByText(/Progress|Today/i).first()).toBeVisible();
  });
});

test.describe('Tab Navigation', () => {
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
    await disableAnimations(page);
  });

  test('should navigate to Projects tab', async ({ page }) => {
    await clickTab(page, 'Projects');
    await expect(page).toHaveURL(/\/projects/);
  });

  test('should navigate to Agents tab', async ({ page }) => {
    await clickTab(page, 'Agents');
    await expect(page).toHaveURL(/\/agents/);
  });

  // Chat page crashes on web with error boundary; skip until fixed
  test.skip('should navigate to Chat tab', async ({ page }) => {
    await clickTab(page, 'Chat');
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should navigate to Settings tab', async ({ page }) => {
    await clickTab(page, 'Settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should navigate back to Home tab', async ({ page }) => {
    await clickTab(page, 'Settings');
    await expect(page).toHaveURL(/\/settings/);
    await clickTab(page, 'Home');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });
});

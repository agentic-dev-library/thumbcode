import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

/**
 * Helper to click a button or link by its text content.
 */
async function clickByText(page: import('@playwright/test').Page, text: string | RegExp) {
  await page.getByText(text).first().click();
}

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

test.describe('User Interactions - Basic', () => {
  test.beforeEach(async ({ page }) => {
    await disableAnimations(page);
  });

  test('should navigate to GitHub auth step', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    await clickByText(page, 'Get Started');
    await page.waitForTimeout(500);
    await expect(page.getByText(/Connect GitHub|GitHub/i).first()).toBeVisible();
  });

  test('should show GitHub auth content', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    await clickByText(page, 'Get Started');
    await page.waitForTimeout(500);
    await expect(page.getByText(/GitHub|Connect|Secure Device Flow/i).first()).toBeVisible();
  });

  test('should navigate to API provider step', async ({ page }) => {
    await page.goto('/onboarding/welcome');
    await clickByText(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
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
    // Navigate through onboarding flow: welcome → github-auth → api-keys → create-project
    await page.goto('/onboarding/welcome');
    await clickByText(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await expect(
      page.getByText(/Create.*Project|First Project|Select Repository/i).first()
    ).toBeVisible();
  });

  test('should show completion screen', async ({ page }) => {
    // Navigate through onboarding flow: welcome → github-auth → api-keys → create-project → complete
    await page.goto('/onboarding/welcome');
    await clickByText(page, 'Get Started');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
    await page.waitForTimeout(500);
    await clickByText(page, 'Skip for Now');
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
    await clickTab(page, 'Agents');
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
    await clickTab(page, 'Chat');
    await page.waitForTimeout(1000);
    await disableAnimations(page);
  });

  test('should display chat page', async ({ page }) => {
    await expect(page).toHaveURL(/\/chat/);
  });

  test('should show chat interface elements', async ({ page }) => {
    // The chat page should render its content — either thread list or the
    // data-testid container.  Verify visible chat-related content on the page.
    const hasChatScreen = await page
      .locator('[data-testid="chat-screen"]')
      .isVisible()
      .catch(() => false);
    const hasChatContent = await page
      .getByText(/thread|new thread|chat|message|start a new/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasChatScreen || hasChatContent).toBe(true);
  });
});

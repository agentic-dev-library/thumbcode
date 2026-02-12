import { expect, test } from '@playwright/test';
import { disableAnimations } from './utils/visual';

/**
 * Helper to click a Pressable element by text.
 * Uses page.mouse to perform a real click at the element's coordinates.
 * This is needed because RN Web Pressable uses the responder system which
 * only responds to real browser pointer events, and the elements may be
 * outside the visible scroll area (body overflow:hidden).
 */
async function clickPressable(page: import('@playwright/test').Page, text: string | RegExp) {
  const textEl = page.getByText(text).first();
  await textEl.waitFor({ state: 'attached', timeout: 10_000 });
  const box = await textEl.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  } else {
    await textEl.evaluate((el) => {
      let target: HTMLElement | null = el as HTMLElement;
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        if (style.cursor === 'pointer') break;
        target = target.parentElement;
      }
      if (!target || target === document.body) target = el as HTMLElement;
      target.click();
    });
  }
}

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome');
    await disableAnimations(page);
  });

  test('should display welcome screen with feature cards', async ({ page }) => {
    // Check welcome screen content
    await expect(page.getByText('ThumbCode')).toBeVisible();
    await expect(page.getByText(/Code with your thumbs/i)).toBeVisible();

    // Check feature cards are visible
    await expect(page.getByText(/AI Agent Teams/i)).toBeVisible();
    await expect(page.getByText(/Mobile-First Git/i)).toBeVisible();
    await expect(page.getByText(/Your Keys, Your Control/i)).toBeVisible();
    await expect(page.getByText(/Zero Server Costs/i)).toBeVisible();
  });

  test('should navigate to GitHub auth step on Get Started', async ({ page }) => {
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);

    // Onboarding is a modal flow - check for GitHub content
    await expect(page.getByText(/Connect GitHub|GitHub/i).first()).toBeVisible();
  });

  test('should show step indicator with multiple steps', async ({ page }) => {
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);

    // Step indicator should show step labels (use exact match for ambiguous terms)
    await expect(page.getByText('GitHub', { exact: true })).toBeVisible();
    await expect(page.getByText('API Keys', { exact: true })).toBeVisible();
    await expect(page.getByText('Project', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
  });

  test('should allow skipping GitHub auth', async ({ page }) => {
    await clickPressable(page, 'Get Started');
    await page.waitForTimeout(500);

    // Click Skip for Now
    await clickPressable(page, 'Skip for Now');
    await page.waitForTimeout(500);

    // Should show API keys step
    await expect(page.getByText(/AI Provider Keys/i)).toBeVisible();
  });
});

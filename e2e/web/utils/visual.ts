import type { Page } from '@playwright/test';

/**
 * Disables animations and transitions for visual regression testing.
 * @param page The Playwright page object.
 */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}

/**
 * Masks elements with dynamic content for visual regression testing.
 * @param page The Playwright page object.
 * @param selectors An array of CSS selectors for elements to mask.
 */
export async function maskDynamicContent(page: Page, selectors: string[]) {
  await page.addStyleTag({
    content: `
      ${selectors.join(', ')} {
        visibility: hidden !important;
      }
    `,
  });
}

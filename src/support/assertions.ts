import { expect, type Page } from '@playwright/test';

/**
 * Asserts the URL matches for the whole window, not just once. Web-first
 * toHaveURL passes on the first match, which hides a URL that is rewritten a
 * moment later (BUG-002).
 */
export async function expectUrlStays(page: Page, url: RegExp, forMs: number): Promise<void> {
  const deadline = Date.now() + forMs;
  await expect(page).toHaveURL(url);
  while (Date.now() < deadline) {
    expect(page.url(), `URL must stay on ${url}`).toMatch(url);
    await page.waitForTimeout(250);
  }
}

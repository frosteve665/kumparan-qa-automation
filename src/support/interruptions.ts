import type { Page } from '@playwright/test';

/**
 * kumparan shows a house promo ("Video Story · Jelajahi Sekarang") once a
 * reader scrolls through an article. It is a full-screen modal that blocks
 * every click behind it. Playwright's locator handler closes it whenever it
 * appears, in any test, without each test having to know about it.
 *
 * Scoped to the promo by its call-to-action, so the share modal (also a modal
 * with a close button) is never touched.
 */
export async function autoDismissPromos(page: Page): Promise<void> {
  const promoCta = page.getByRole('button', { name: 'Jelajahi Sekarang' });
  const promo = page
    .locator('div')
    .filter({ has: promoCta })
    .filter({ has: page.getByTestId('close') })
    .last();
  await page.addLocatorHandler(promoCta, async () => {
    await promo
      .getByRole('button')
      .filter({ has: page.getByTestId('close') })
      .click();
  });
}

// spec: specs/search-share-navigation.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../src/fixtures';

test.describe('Navigation (agent)', { tag: ['@agent', '@navigation'] }, () => {
  // Review: planned and generated for kumparan.com (desktop); runs in the desktop project only
  // (see testIgnore in playwright.config.ts). Mobile agent specs are in tests/agent/mobile/.

  test('[TC-AGT-007] header and sub-menu routes', async ({ home, page }) => {
    await home.open();

    // 1. From the homepage click ft-loadmore 'Lihat lainnya' in the Trending section.
    await home.clickUntilUrl(page.getByTestId('trending-section').getByTestId('ft-loadmore').first(), /\/trending/);
    await expect(page).toHaveURL(/\/trending/);
    await expect(page.getByTestId('tab-semua').first()).toBeVisible();
    await expect(page.getByTestId('trending-stories-card').first()).toBeVisible();

    // 2. Click hd-logo, then via the header sub menu open Breaking News and Audio Story, using hd-home to return each time.
    await home.header.clickUntilUrl(home.header.logo, /^https:\/\/kumparan\.com\/?$/);
    await expect(page).toHaveURL(/^https:\/\/kumparan\.com\/?$/);

    await page.getByRole('link', { name: 'Breaking News', exact: true }).first().click();
    await expect(page).toHaveURL(/\/breakingnews/);
    await expect(page.getByTestId('breaking-news-hero-card').first()).toBeVisible();

    await page.getByTestId('hd-home').first().click();
    await expect(page).toHaveURL(/^https:\/\/kumparan\.com\/?$/);

    await page.getByRole('link', { name: 'Audio Story', exact: true }).first().click();
    await expect(page).toHaveURL(/\/audio-story/);
    await expect(page.getByTestId(/^(regular|big)-audio-story-card$/).first()).toBeVisible();

    await page.getByTestId('hd-home').first().click();
    await expect(page).toHaveURL(/^https:\/\/kumparan\.com\/?$/);

    // 3. Click more-vertical in main-menu.
    await page.getByTestId('main-menu').getByTestId('more-vertical').click();
    const popover = page.getByTestId('more-popover-menu');
    await expect(popover).toBeVisible();
    await expect(popover.getByText('Galeri Foto')).toBeVisible();
    await expect(popover.getByText('Kabar Daerah')).toBeVisible();
    await expect(popover.getByText('Polling')).toBeVisible();
  });

  test('[TC-AGT-008] guest notification, theme toggle persistence, invalid route', async ({ home, header, page }) => {
    await home.open();

    // 1. Click hd-notification as a guest (do not submit any login form).
    // Review: the header always shows "Masuk", so a text check could never fail;
    // assert the guest is actually sent to the login form instead (retrying the
    // click until the page is interactive, as the hand-written suite does).
    await home.clickUntilUrl(page.getByTestId('hd-notification').first(), /\/login/);
    await expect(page.getByTestId('input-email')).toBeVisible();

    // 2. Go back to home, click hd-theme (moon), then navigate to /trending and to /search/banjir.
    await home.open();
    await header.toggleTheme();
    const DARK = 'rgb(24, 24, 24)';
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    await page.goto('/trending', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    await page.goto('/search/banjir', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    // 3. Navigate directly to /this-page-does-not-exist-12345.
    const response = await page.goto('/this-page-does-not-exist-12345', { waitUntil: 'domcontentloaded' });
    expect(response?.status() ?? 404).toBeLessThan(500);
    await expect(header.logo).toBeVisible();
    await header.clickUntilUrl(header.logo, /^https:\/\/kumparan\.com\/?$/);
    await expect(page).toHaveURL(/^https:\/\/kumparan\.com\/?$/);
  });
});

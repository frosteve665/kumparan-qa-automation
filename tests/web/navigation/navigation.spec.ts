import { test, expect } from '../../../src/fixtures';

const DARK_BODY = 'rgb(24, 24, 24)';

test.describe('Navigation and preferences', { tag: '@navigation' }, () => {
  test('[TC-NAV-001] channel menu opens the News channel', { tag: ['@p2', '@positive'] }, async ({ home, page }) => {
    await home.open();

    await home.header.clickUntilUrl(home.header.channelLink('News'), /\/channel\/news/);

    await expect(page).toHaveURL(/\/channel\/news$/);
    await expect(page.getByTestId('channel-title').or(page.getByTestId('news-card')).first()).toBeVisible();
  });

  test('[TC-NAV-002] mobile side menu opens and closes', { tag: ['@p2', '@positive'] }, async ({ home, header, page, platform }) => {
    test.skip(platform !== 'mobile', 'The side menu exists on the mobile site only');
    await home.open();

    await header.openSideMenu();
    await expect(page.getByTestId('close-sidebar')).toBeInViewport();
    await expect(page.getByText('Mode Gelap')).toBeInViewport();

    await header.closeSideMenu();
    await expect(page.getByText('Mode Gelap')).not.toBeInViewport();
  });

  test('[TC-NAV-003] dark mode switches the theme and survives a reload', { tag: ['@p3', '@positive', '@state'] }, async ({ home, header, page }) => {
    await home.open();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).not.toBe('dark');

    await header.toggleTheme();

    await expect(page.locator('body')).toHaveCSS('background-color', DARK_BODY);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toHaveCSS('background-color', DARK_BODY);
  });

  test('[TC-NAV-004] "Lihat lainnya" on trending opens the Trending page', { tag: ['@p2', '@positive'] }, async ({ home, page, platform }) => {
    test.skip(platform === 'mobile', 'Mobile reaches Trending through the top-nav strip (covered by TC-NAV-006)');
    await home.open();

    await home.clickUntilUrl(page.getByTestId('trending-section').getByTestId('ft-loadmore'), /\/trending/);

    await expect(page.getByTestId('trending-stories-card').first()).toBeVisible();
  });

  test('[TC-NAV-005] homepage loads without first-party JavaScript errors', {
    tag: ['@p2', '@edge', '@quality'],
    annotation: { type: 'issue', description: 'BUG-003: React hydration mismatch (error #418) on the desktop homepage' },
  }, async ({ home, page, platform }) => {
    test.fail(platform === 'desktop', 'Known defect BUG-003 still reproduces on desktop');
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await home.open();
    await expect(home.headlineCards.first()).toBeVisible();

    // Third-party scripts (ads/analytics) are blocked or out of kumparan's
    // control; only uncaught errors raised by the page itself count.
    expect(errors, 'uncaught errors on the homepage').toEqual([]);
  });

  test('[TC-NAV-006] mobile top-nav strip opens Trending', { tag: ['@p2', '@positive'] }, async ({ home, page, platform }) => {
    test.skip(platform !== 'mobile', 'The nb-* top-nav strip exists on the mobile site only');
    await home.open();

    await home.clickUntilUrl(page.getByTestId('nb-trending'), /\/trending/);

    await expect(page.getByTestId('trending-stories-card').first()).toBeVisible();
  });
});

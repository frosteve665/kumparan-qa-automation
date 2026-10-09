import { test, expect } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

test.describe('Search', { tag: '@search' }, () => {
  test('[TC-SRCH-001] keyword search from the header returns relevant stories', { tag: ['@smoke', '@p1', '@positive'] }, async ({ home, search, page }) => {
    await home.open();

    await home.header.search(SEARCH.keyword);

    await expect(page).toHaveURL(new RegExp(`/search/${SEARCH.keyword}`));
    await expect(search.results.first()).toBeVisible();
    // Relevance: at least one of the top results mentions the keyword.
    const titles = (await search.resultTitles.allInnerTexts()).slice(0, 10).join(' ').toLowerCase();
    expect(titles).toContain(SEARCH.keyword);
  });

  for (const tab of SEARCH.tabs) {
    test(`[TC-SRCH-002] "${tab.id}" tab switches results to ${tab.path}`, { tag: ['@p2', '@positive'] }, async ({ search, page }) => {
      await search.open(SEARCH.keyword);

      await search.tab(tab.id).click();

      await expect(page).toHaveURL(new RegExp(`/search/${SEARCH.keyword}/${tab.path}$`));
      await expect(page.getByTestId(tab.resultCard).first()).toBeVisible();
    });
  }

  test('[TC-SRCH-003] "Terbaru" sort switches to newest-first', { tag: ['@p2', '@positive', '@state'] }, async ({ search }) => {
    await search.open(SEARCH.keyword);
    await expect(search.sortRelevant.active).toBeVisible();

    await search.sortNewest.inactive.click();

    await expect(search.sortNewest.active).toBeVisible();
    await expect(search.sortRelevant.inactive).toBeVisible();
    await expect(search.results.first()).toBeVisible();
  });

  test('[TC-SRCH-004] nonsense keyword shows the "not found" state', { tag: ['@p2', '@negative'] }, async ({ search }) => {
    await search.open(SEARCH.nonsense);

    await expect(search.results).toHaveCount(0);
    await expect(search.notFound).toBeVisible();
  });

  test('[TC-SRCH-005] submitting an empty query stays on the search landing page', { tag: ['@p2', '@negative', '@boundary'] }, async ({ home, search, page, platform }) => {
    await home.open();
    if (platform === 'mobile') await home.header.searchEntry.click();

    await search.input.press('Enter');

    await expect(page).toHaveURL(/\/search\/?$/);
    await expect(search.results).toHaveCount(0);
  });

  test('[TC-SRCH-006] one-character query is accepted', { tag: ['@p3', '@boundary'] }, async ({ search, page }) => {
    await search.open('a');

    await expect(page).toHaveURL(/\/search\/a$/);
    await expect(search.results.first().or(search.notFound)).toBeVisible();
  });

  test('[TC-SRCH-007] 200-character query is handled without error', { tag: ['@p3', '@boundary'] }, async ({ search, page }) => {
    const response = await page.goto(`/search/${SEARCH.longQuery}`, { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBeLessThan(500);
    await expect(search.results.first().or(search.notFound)).toBeVisible();
  });

  test('[TC-SRCH-008] HTML typed into search is shown as text, never rendered', { tag: ['@p1', '@edge', '@security'] }, async ({ home, search, page }) => {
    await home.open();

    await home.header.search(SEARCH.htmlProbe);

    await expect(page).toHaveURL(/\/search\/%3Cb%3E/i);
    await expect(search.notFound.or(search.results.first())).toBeVisible();
    // The probe's <b> must not become a real element anywhere in the page.
    await expect(page.locator('b', { hasText: SEARCH.htmlProbeText })).toHaveCount(0);
  });

  test('[TC-SRCH-009] emoji and unicode queries are encoded and searched', { tag: ['@p3', '@edge'] }, async ({ home, search, page }) => {
    await home.open();

    await home.header.search(SEARCH.emojiQuery);

    await expect(page).toHaveURL(/\/search\/%F0%9F%99%82/);
    await expect(search.results.first().or(search.notFound)).toBeVisible();
  });

  test('[TC-SRCH-010] query with "&" is encoded, not split', { tag: ['@p3', '@edge'] }, async ({ home, search, page }) => {
    await home.open();

    await home.header.search(SEARCH.ampersandQuery);

    await expect(page).toHaveURL(/\/search\/food%20%26%20travel$/);
    await expect(search.results.first()).toBeVisible();
  });
});

// spec: specs/search-share-navigation.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../src/fixtures';

test.describe('Search (agent)', { tag: ['@agent', '@search'] }, () => {
  // Review: planned and generated for kumparan.com (desktop); runs in the desktop project only
  // (see testIgnore in playwright.config.ts). Mobile agent specs are in tests/agent/mobile/.

  test('[TC-AGT-001] search a common term and switch result tabs', async ({ page, home, header }) => {
    // 1. From the homepage, fill input-search with 'banjir' and press Enter.
    await home.open();
    await header.search('banjir');
    await expect(page).toHaveURL(/\/search\/banjir/);
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();
    for (const id of ['tab-story', 'tab-video-story', 'tab-kumparan_plus', 'tab-topic', 'tab-user', 'tab-publisher']) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    // 2. Click each tab in turn (btn-follow is never clicked).
    const tabs: Array<[string, RegExp, string]> = [
      ['tab-video-story', /\/search\/banjir\/video$/, 'video-story-card'],
      ['tab-kumparan_plus', /\/search\/banjir\/collection$/, 'collection-card'],
      ['tab-topic', /\/search\/banjir\/topik$/, 'search-topic-result-card'],
      ['tab-user', /\/search\/banjir\/user$/, 'search-user-result-card'],
      ['tab-publisher', /\/search\/banjir\/publisher$/, 'search-publisher-result-card'],
    ];
    for (const [tab, url, card] of tabs) {
      await page.getByTestId(tab).click();
      await expect(page).toHaveURL(url);
      await expect(page.getByTestId(card).first()).toBeVisible();
    }
  });

  test('[TC-AGT-002] no-result term shows empty state', async ({ page, home, header }) => {
    // 1. Search for the nonsense term via input-search + Enter.
    await home.open();
    await header.search('zzqxjkvv1234');
    await expect(page).toHaveURL(/\/search\/zzqxjkvv1234$/);
    await expect(page.getByTestId('story-not-found')).toBeVisible();
    await expect(page.getByTestId('story-not-found')).toContainText('Story tidak ditemukan');
    await expect(page.getByTestId('news-card-gallery-v2')).toHaveCount(0);
    await expect(page.getByTestId('tab-story')).toBeVisible();
    await expect(page.getByTestId('relevant-active')).toBeVisible();
  });

  test('[TC-AGT-003] boundary queries: empty, single char, very long, special characters', async ({ page, home, header }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (d) => { dialogs.push(d.message()); await d.dismiss(); });

    // 1. Focus input-search and press Enter with an empty value.
    await home.open();
    await header.search('');
    await expect(header.logo).toBeVisible();
    await expect(page.getByTestId('input-search').first()).toBeVisible();
    await expect(page).not.toHaveURL(/\/search\/.+/);

    // 2. Search 'a', a 300-character string, then a special-character string.
    const terms = ['a', 'x'.repeat(300), '<script>alert(1)</script> & %20 "'];
    for (const term of terms) {
      await header.search(term);
      await expect(page).toHaveURL(/\/search\/.+/);
      await expect(page.getByTestId('story-result-card').first().or(page.getByTestId('story-not-found'))).toBeVisible();
      await expect(page.getByTestId('tab-story')).toBeVisible();
    }
    expect(dialogs).toEqual([]);
  });

  test('[TC-AGT-004] sort Terbaru/Relevansi and clear with x-circle', async ({ page, search, header }) => {
    // 1. Search 'banjir jakarta'; the term is URL-encoded in the path.
    await search.open();
    await header.search('banjir jakarta');
    await expect(page).toHaveURL(/\/search\/banjir(%20|\+)jakarta/);
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();

    // 2. Click newest-non-active, then relevant-non-active.
    await page.getByTestId('newest-non-active').click();
    await expect(page.getByTestId('newest-active')).toBeVisible();
    await expect(page.getByTestId('relevant-non-active')).toBeVisible();
    await page.getByTestId('relevant-non-active').click();
    await expect(page.getByTestId('relevant-active')).toBeVisible();
    await expect(page.getByTestId('story-result-card').first()).toBeVisible();

    // 3. Click x-circle.
    await page.getByTestId('x-circle').click();
    await expect(page).toHaveURL(/\/search\/?$/);
    await expect(page.getByTestId('popular-list').first()).toBeVisible();
    await expect(page.getByTestId('input-search').first()).toHaveValue('');
  });
});

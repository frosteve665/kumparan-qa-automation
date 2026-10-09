// spec: specs/search-share-navigation.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../src/fixtures';
import { ArticlePage } from '../../../src/pages/article.page';

test.describe('Share (agent)', { tag: ['@agent', '@share'] }, () => {
  // Review: planned and generated for kumparan.com (desktop); mobile agent specs are in tests/agent/mobile/.
  test.skip(({ platform }) => platform !== 'desktop', 'Generated for the desktop site');

  test('[TC-AGT-005] share bar whatsapp popup and copy link', async ({ home, article, page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright');
    // 1. Open the first article from the homepage headline; scroll to share-wrapper.
    await home.open();
    await expect(home.headlineCards.first()).toBeVisible();
    // The card itself is not the link; its title is (same approach as TC-HOME-002).
    await home.headlineCards.first().getByTestId('title').first().click();
    await expect(article.title).toBeVisible();
    await article.shareBar.scrollIntoViewIfNeeded();
    await expect(article.shareWhatsApp).toBeVisible();
    await expect(article.shareCopyLink).toBeVisible();
    await expect(article.shareMore).toBeVisible();
    const headline = (await article.title.innerText()).trim();
    const articleUrl = page.url();

    // 2. Click sosmed-whatsapp and capture the popup; read its URL only.
    const popupUrl = new URL(await article.shareVia(article.shareWhatsApp));
    expect(popupUrl.hostname).toBe('api.whatsapp.com');
    const text = popupUrl.searchParams.get('text') ?? '';
    expect(text).toContain(headline.slice(0, 30));
    expect(text).toMatch(/https:\/\/kumparan\.com\/\S+/);

    // 3. Grant clipboard permissions, click copy-circle.
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await article.shareCopyLink.click();
    await expect(article.copiedToast).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/^https:\/\/kumparan\.com\//);
    // Share links use the short form /<channel>/<storyId>; compare channel and the 11-character story id.
    const articleSegments = new URL(articleUrl).pathname.replace(/\/full$/, '').split('/');
    const articleSlug = articleSegments.pop() ?? '';
    expect(new URL(copied).pathname).toBe(`${articleSegments.join('/')}/${ArticlePage.storyId(articleSlug)}`);
  });

  test('[TC-AGT-006] share more menu lists channels and closes; closing leaves article intact', async ({ article, articlePath, search, page }) => {
    // 1. On an article click more-vertical in share-wrapper.
    await article.open(articlePath);
    const headline = (await article.title.innerText()).trim();
    const urlBefore = page.url();
    let popups = 0;
    page.on('popup', () => popups++);
    await article.openShareMenu();
    for (const id of ['share-whatsapp', 'share-fb', 'share-twitter', 'share-line', 'share-copy-clipboard']) {
      await expect(article.shareModal.getByTestId(id)).toBeVisible();
    }

    // 2. Close the modal with its close button.
    // Review: the Escape check moved to its own known-defect test (TC-AGT-009),
    // so a mid-test fixme no longer skips the non-ASCII check below.
    await article.shareModal.getByTestId('btn-close-modal').click();
    await expect(article.shareModal).toBeHidden();
    await expect(page).toHaveURL(urlBefore);
    await expect(article.title).toHaveText(headline);
    expect(popups).toBe(0);

    // 3. Repeat on an article with a non-ASCII headline (search a term with accents).
    await search.open('café');
    await expect(search.results.first()).toBeVisible();
    await search.results.first().click();
    await expect(article.title).toBeVisible();
    const longHeadline = (await article.title.innerText()).trim();
    const shareUrl = new URL(await article.shareVia(article.shareWhatsApp));
    const text = shareUrl.searchParams.get('text') ?? '';
    expect(text).toContain(longHeadline.slice(0, 30));
    expect(text).toMatch(/https:\/\/kumparan\.com\/\S+/);
  });

  test('[TC-AGT-009] share modal closes with Escape like an accessible dialog', {
    annotation: { type: 'issue', description: 'BUG-006: share modal ignores Escape and lacks dialog semantics' },
  }, async ({ article, articlePath, page }) => {
    // Found by the healer agent; confirmed by hand on desktop and mobile (review).
    test.fail(true, 'Known defect BUG-006 still reproduces');
    await article.open(articlePath);
    await article.openShareMenu();

    await page.keyboard.press('Escape');

    await expect(article.shareModal).toBeHidden();
  });
});

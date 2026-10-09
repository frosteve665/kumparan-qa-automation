import { test, expect } from '../../../src/fixtures';
import { ArticlePage } from '../../../src/pages/article.page';

/**
 * Share. Popups to WhatsApp/Facebook/X/LINE are answered by a local stub
 * (see src/support/network.ts), so the test reads exactly what would be shared
 * without loading any third-party site.
 */
test.describe('Share a story', { tag: '@share' }, () => {
  test('[TC-SHR-001] WhatsApp share carries the headline and the story link', { tag: ['@p1', '@positive'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);
    const headline = (await article.title.innerText()).trim();

    const shareUrl = new URL(await article.shareVia(article.shareWhatsApp));

    expect(shareUrl.hostname).toBe('api.whatsapp.com');
    const text = shareUrl.searchParams.get('text') ?? '';
    expect(text).toContain(headline.slice(0, 30));
    expect(text).toContain(`kumparan.com/${articlePath.split('/')[1]}/${ArticlePage.storyId(articlePath)}`);
  });

  test('[TC-SHR-002] share menu lists every share channel', { tag: ['@p2', '@positive'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);

    await article.openShareMenu();

    for (const id of ['share-whatsapp', 'share-fb', 'share-twitter', 'share-line', 'share-copy-clipboard']) {
      await expect(article.shareModal.getByTestId(id)).toBeVisible();
    }
  });

  test('[TC-SHR-003] copy link puts the story link on the clipboard and confirms it', { tag: ['@p1', '@positive'] }, async ({ article, articlePath, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await article.open(articlePath);

    await article.shareCopyLink.click();

    await expect(article.copiedToast).toBeVisible();
    const copied = await article.page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(new RegExp(`^https://kumparan\\.com/${articlePath.split('/')[1]}/${ArticlePage.storyId(articlePath)}\\?`));
  });

  for (const channel of [
    { id: 'share-fb', host: /facebook\.com/ },
    { id: 'share-twitter', host: /(twitter|x)\.com/ },
    { id: 'share-line', host: /line\.me/ },
  ]) {
    test(`[TC-SHR-004] "${channel.id}" from the share menu carries the story link`, { tag: ['@p2', '@positive'] }, async ({ article, articlePath }) => {
      await article.open(articlePath);
      await article.openShareMenu();

      const shareUrl = await article.shareVia(article.shareModal.getByTestId(channel.id));

      expect(shareUrl).toMatch(channel.host);
      expect(decodeURIComponent(shareUrl)).toContain(ArticlePage.storyId(articlePath));
    });
  }

  test('[TC-SHR-005] shared links are absolute https URLs on kumparan.com', { tag: ['@p3', '@edge', '@data'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);

    const text = new URL(await article.shareVia(article.shareWhatsApp)).searchParams.get('text') ?? '';
    const link = /https?:\/\/\S+/.exec(text)?.[0] ?? '';

    expect(link).toMatch(/^https:\/\/kumparan\.com\//);
  });

  test('[TC-SHR-006] share menu closes with its close button', { tag: ['@p3', '@edge'] }, async ({ article, articlePath, page }) => {
    await article.open(articlePath);
    await article.openShareMenu();

    await article.shareModal.getByTestId('btn-close-modal').click();

    await expect(article.shareModal).toBeHidden();
    await expect(page).toHaveURL(new RegExp(articlePath.split('/').pop()!));
  });
});

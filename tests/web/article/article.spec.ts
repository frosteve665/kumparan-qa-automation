import { test, expect } from '../../../src/fixtures';

test.describe('Article view', { tag: '@article' }, () => {
  test('[TC-ART-001] article shows title, byline, date and body', { tag: ['@smoke', '@p1'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);

    await expect(article.title).not.toBeEmpty();
    await expect(article.author).toBeVisible();
    await expect(article.channel).toBeVisible();
    await expect(article.publishDate).not.toBeEmpty();
    await expect(article.paragraphs.first()).not.toBeEmpty();
    expect(await article.paragraphs.count()).toBeGreaterThan(1);
  });

  test('[TC-ART-002] engagement bar offers like, comment and share', { tag: ['@smoke', '@p1'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);

    await expect(article.likeButton).toBeVisible();
    await expect(article.commentButton).toBeVisible();
    await expect(article.shareBar).toBeVisible();
    await expect(article.reportButton).toBeAttached();
    // Counters are numeric, never placeholder text such as "NaN" or "undefined".
    await expect(article.likeButton).toHaveText(/^\s*[\d.,]+\s*(rb|jt|k)?\s*$/i);
    await expect(article.commentButton).toHaveText(/^\s*[\d.,]+\s*(rb|jt|k)?\s*$/i);
  });

  test('[TC-ART-003] page title and canonical URL identify the story', { tag: ['@p2', '@seo'] }, async ({ article, articlePath, page }) => {
    await article.open(articlePath);
    const headline = (await article.title.innerText()).trim();

    await expect(page).toHaveTitle(new RegExp(`${headline.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*\\| kumparan\\.com`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${articlePath.split('/').pop()}$`));
  });

  test('[TC-ART-004] unknown story URL returns 404 and keeps site navigation', { tag: ['@p2', '@error-handling'] }, async ({ page, home }) => {
    const response = await page.goto('/kumparannews/qa-automation-story-that-does-not-exist-00000000000', { waitUntil: 'domcontentloaded' });

    expect(response?.status()).toBe(404);
    await expect(home.header.logo).toBeVisible();
  });

  test('[TC-ART-005] breadcrumb Home returns to the homepage', { tag: ['@p3'] }, async ({ article, articlePath, home, page }) => {
    await article.open(articlePath);

    await article.breadcrumbHome.click();

    await expect(page).toHaveURL(/kumparan\.com\/?$/);
    await expect(home.headlineCards.first()).toBeVisible();
  });
});

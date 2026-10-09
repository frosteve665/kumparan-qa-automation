import { test, expect } from '../../../src/fixtures';

test.describe('Like as a guest', { tag: '@like' }, () => {
  test('[TC-LIKE-004] guest who taps like is sent to login and the count does not change', { tag: ['@p1', '@authorization', '@negative'] }, async ({ article, articlePath, login, page }) => {
    await article.open(articlePath);
    const before = await article.likeCount();

    await article.tapLikeExpectingLogin();

    await expect(page).toHaveURL(/\/login/);
    await expect(login.email).toBeVisible();

    await article.open(articlePath);
    expect(await article.likeCount(), 'guest like must not be counted').toBe(before);
  });
});

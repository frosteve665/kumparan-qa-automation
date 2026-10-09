import { test, expect } from '../../../src/fixtures';

test.describe('Home feed', { tag: '@home' }, () => {
  test('[TC-HOME-001] homepage loads with header, headlines and story cards', { tag: ['@smoke', '@p1'] }, async ({ home }) => {
    await home.open();

    await expect(home.header.logo).toBeVisible();
    await expect(home.header.loginEntry.or(home.header.burgerMenu).first()).toBeVisible();
    await expect(home.headlineCards.first()).toBeVisible();
    expect(await home.headlineCards.count()).toBeGreaterThanOrEqual(3);
    await expect(home.storyTitles.first()).not.toBeEmpty();
  });

  test('[TC-HOME-002] opening a headline navigates to its article', { tag: ['@smoke', '@p1'] }, async ({ home, article, page }) => {
    await home.open();
    const card = home.headlineCards.first();
    const expectedTitle = (await card.getByTestId('title').first().innerText()).trim();

    await card.getByTestId('title').first().click();

    await expect(page).not.toHaveURL(/kumparan\.com\/?$/);
    await expect(article.title).toBeVisible();
    // Card titles can be truncated with an ellipsis; compare the leading words.
    await expect(article.title).toContainText(expectedTitle.replace(/\.{3}|…$/, '').slice(0, 25));
  });
});

test.describe('Home feed with ads', { tag: '@home' }, () => {
  test.use({ allowAds: true });

  test('[TC-HOME-003] homepage stays usable with real ads enabled', { tag: ['@p2', '@ads-on'] }, async ({ home }) => {
    // Every other test blocks ad hosts for stability; this one proves that
    // blocking hides nothing: with ads on, core navigation is still reachable.
    test.info().annotations.push({ type: 'note', description: 'Runs with third-party ads enabled' });
    await home.open();
    await home.dismissInterstitial();
    await expect(home.header.logo).toBeVisible();
    await expect(home.headlineCards.first()).toBeVisible();
  });
});

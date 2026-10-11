import { test } from '../../../src/fixtures';
const CASE = '[TC-NAV-006] Mobile top-nav strip opens Trending';

test(CASE, { tag: ['@p2', '@mobile-only'] }, async ({ home }) => {
  await home.open();
  await home.openTrending();
  await home.verifyTrendingShown();
});

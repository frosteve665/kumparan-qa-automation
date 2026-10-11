import { test } from '../../../src/fixtures';
const CASE = '[TC-NAV-004] "Lihat lainnya" on trending opens the Trending page';

// Desktop only: mobile reaches Trending through the top-nav strip (TC-NAV-006).
test(CASE, { tag: ['@p2', '@desktop-only'] }, async ({ home }) => {
  await home.open();
  await home.openTrending();
  await home.verifyTrendingShown();
});

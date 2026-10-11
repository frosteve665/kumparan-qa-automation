import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-003] "Terbaru" sort switches to newest-first';

test(CASE, { tag: ['@p2'] }, async ({ search }) => {
  await search.open(SEARCH.keyword);
  await search.sortByNewest();
  await search.verifySortedByNewest();
});

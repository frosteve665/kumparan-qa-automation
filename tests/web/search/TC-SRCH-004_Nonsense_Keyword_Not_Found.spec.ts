import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-004] Nonsense keyword shows the "not found" state';

test(CASE, { tag: ['@p2'] }, async ({ search }) => {
  await search.open(SEARCH.nonsense);
  await search.verifyNotFound();
});

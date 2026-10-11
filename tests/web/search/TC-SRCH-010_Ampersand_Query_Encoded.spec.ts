import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-010] Query with "&" is encoded, not split';

test(CASE, { tag: ['@p3'] }, async ({ home, search }) => {
  await home.open();
  await home.header.search(SEARCH.ampersandQuery);

  await search.verifyUrl(/\/search\/food%20%26%20travel$/);
  await search.verifyResultsShown();
});

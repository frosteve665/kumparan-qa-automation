import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-002] Result tab switches the result type';

for (const tab of SEARCH.tabs) {
  test(`${CASE}: ${tab.id}`, { tag: ['@p2'] }, async ({ search }) => {
    await search.open(SEARCH.keyword);
    await search.openTab(tab.id);

    await search.verifyUrl(new RegExp(`/search/${SEARCH.keyword}/${tab.path}$`));
    await search.verifyTabResults(tab.resultCard);
  });
}

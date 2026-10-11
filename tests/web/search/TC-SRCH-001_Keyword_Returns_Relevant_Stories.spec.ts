import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-001] Keyword search from the header returns relevant stories';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ home, search }) => {
  await home.open();
  await home.header.search(SEARCH.keyword);

  await search.verifyUrl(new RegExp(`/search/${SEARCH.keyword}`));
  await search.verifyResultsMention(SEARCH.keyword);
});

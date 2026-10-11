import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-009] Emoji and unicode queries are encoded and searched';

test(CASE, { tag: ['@p3'] }, async ({ home, search }) => {
  await home.open();
  await home.header.search(SEARCH.emojiQuery);

  await search.verifyUrl(/\/search\/%F0%9F%99%82/);
  await search.verifyResultsOrNotFound();
});

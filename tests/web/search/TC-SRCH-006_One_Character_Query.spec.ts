import { test } from '../../../src/fixtures';
const CASE = '[TC-SRCH-006] One-character query is accepted';

test(CASE, { tag: ['@p3'] }, async ({ search }) => {
  await search.open('a');
  await search.verifyUrl(/\/search\/a$/);
  await search.verifyResultsOrNotFound();
});

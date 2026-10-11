import { test, expect } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-007] 200-character query is handled without error';

test(CASE, { tag: ['@p3'] }, async ({ search }) => {
  const status = await search.open(SEARCH.longQuery);

  expect(status).toBeLessThan(500);
  await search.verifyResultsOrNotFound();
});

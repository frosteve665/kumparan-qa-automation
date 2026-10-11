import { test } from '../../../src/fixtures';
const CASE = '[TC-SRCH-005] Submitting an empty query stays on the search landing page';

test(CASE, { tag: ['@p2'] }, async ({ home, search }) => {
  await home.open();
  await home.header.submitEmptySearch();
  await search.verifyLandingPage();
});

import { test } from '../../../src/fixtures';
const CASE = '[TC-HOME-001] Homepage loads with header, headlines and story cards';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ home }) => {
  await home.open();
  await home.verifyShown();
});

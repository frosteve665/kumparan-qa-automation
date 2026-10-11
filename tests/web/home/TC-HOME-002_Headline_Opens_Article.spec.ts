import { test } from '../../../src/fixtures';
const CASE = '[TC-HOME-002] Opening a headline navigates to its article';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ home, article }) => {
  await home.open();
  const cardTitle = await home.openFirstHeadline();

  // Card titles can be cut with an ellipsis, so compare the first words.
  await article.verifyHeadlineStartsWith(cardTitle.replace(/(\.{3}|…)$/, '').slice(0, 25));
});

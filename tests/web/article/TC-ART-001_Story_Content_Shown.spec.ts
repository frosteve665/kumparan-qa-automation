import { test } from '../../../src/fixtures';
const CASE = '[TC-ART-001] Article shows title, byline, date and body';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.verifyStoryContent();
});

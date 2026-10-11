import { test } from '../../../src/fixtures';
const CASE = '[TC-ART-002] Engagement bar offers like, comment and share with numeric counters';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.verifyEngagementBar();
});

import { test } from '../../../src/fixtures';
const CASE = '[TC-ART-003] Page title and canonical URL identify the story';

test(CASE, { tag: ['@p2'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.verifyPageTitleAndCanonical(articlePath);
});

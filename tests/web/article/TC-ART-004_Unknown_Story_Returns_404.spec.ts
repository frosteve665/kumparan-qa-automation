import { test, expect } from '../../../src/fixtures';
import { ARTICLE } from '../../../src/data/article.data';

const CASE = '[TC-ART-004] Unknown story URL returns 404 and keeps site navigation';

test(CASE, { tag: ['@p2'] }, async ({ article }) => {
  const status = await article.openMissing(ARTICLE.missingStoryPath);

  expect(status).toBe(404);
  await article.header.verifyLogoShown();
});

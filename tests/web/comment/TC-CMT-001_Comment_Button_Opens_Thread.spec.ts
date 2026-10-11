import { test } from '../../../src/fixtures';
const CASE = '[TC-CMT-001] Comment button opens the story comment thread';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ article, articlePath, comments }) => {
  await article.open(articlePath);
  const headline = await article.headline();

  await article.openComments();
  await comments.verifyThreadFor(headline, articlePath);
});

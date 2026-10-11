import { test } from '../../../src/fixtures';
const CASE = '[TC-CMT-002] Comment count on the article matches the thread';

test(CASE, { tag: ['@p2'] }, async ({ article, articlePath, comments }) => {
  await article.open(articlePath);
  const count = await article.commentCount();

  await article.openComments();
  await comments.verifyCommentCount(count);
});

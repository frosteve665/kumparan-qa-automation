import { test } from '../../../src/fixtures';
const CASE = '[TC-LIKE-004] Guest who taps like is sent to login and the count does not change';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath, login }) => {
  await article.open(articlePath);
  const likesBefore = await article.likeCount();

  await article.tapLikeAsGuest();
  await login.verifyShown();

  await article.open(articlePath);
  await article.verifyLikeCount(likesBefore);
});

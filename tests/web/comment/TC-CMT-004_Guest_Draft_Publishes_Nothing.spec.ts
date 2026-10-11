import { test, expect } from '../../../src/fixtures';
import { ARTICLE } from '../../../src/data/article.data';

const CASE = '[TC-CMT-004] Guest typing a comment publishes nothing';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath, comments }) => {
  await article.open(articlePath);
  await article.openComments();
  const stopWatching = comments.watchCommentWrites();

  await comments.typeComment(ARTICLE.guestCommentDraft);

  await comments.verifyDraft(ARTICLE.guestCommentDraft);
  expect(stopWatching(), 'comment requests sent').toEqual([]);
  // OBS-001: a guest gets no login prompt while drafting (docs/findings.md).
});

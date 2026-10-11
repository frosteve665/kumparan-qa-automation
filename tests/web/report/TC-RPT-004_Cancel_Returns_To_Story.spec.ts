import { test } from '../../../src/fixtures';
const CASE = '[TC-RPT-004] Cancel from the story returns to the story without reporting';

test(CASE, { tag: ['@p2'] }, async ({ article, articlePath, report }) => {
  await article.open(articlePath);
  await article.openReport();
  await report.selectReason(0);

  await report.cancel();
  await article.verifyOpen(articlePath);
});

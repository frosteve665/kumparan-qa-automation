import { test } from '../../../src/fixtures';
const CASE = '[TC-RPT-001] Report opens "Laporkan Konten" with six reasons';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath, report }) => {
  await article.open(articlePath);
  const headline = await article.headline();

  await article.openReport();
  await report.verifyShownFor(headline);
  await report.verifyAllReasons();
});

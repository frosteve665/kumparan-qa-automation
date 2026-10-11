import { test } from '../../../src/fixtures';
const CASE = '[TC-ART-005] Breadcrumb Home returns to the homepage';

test(CASE, { tag: ['@p3'] }, async ({ article, articlePath, home }) => {
  await article.open(articlePath);
  await article.goHomeViaBreadcrumb();
  await home.verifyIsHomepage();
});

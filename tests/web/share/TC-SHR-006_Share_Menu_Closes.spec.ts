import { test } from '../../../src/fixtures';
const CASE = '[TC-SHR-006] Share menu closes with its close button';

test(CASE, { tag: ['@p3'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.openShareMenu();

  await article.closeShareMenu();
  await article.verifyShareMenuClosed();
  await article.verifyOpen(articlePath);
});

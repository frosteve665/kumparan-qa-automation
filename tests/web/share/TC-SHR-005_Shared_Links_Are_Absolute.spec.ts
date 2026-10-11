import { test } from '../../../src/fixtures';
const CASE = '[TC-SHR-005] Shared links are absolute https URLs on kumparan.com';

test(CASE, { tag: ['@p3'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.verifyWhatsAppLinkIsAbsolute();
});

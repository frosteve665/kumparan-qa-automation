import { test } from '../../../src/fixtures';
const CASE = '[TC-SHR-003] Copy link puts the story link on the clipboard and confirms it';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright');
  await article.open(articlePath);
  await article.verifyCopiedLinkPointsTo(articlePath);
});

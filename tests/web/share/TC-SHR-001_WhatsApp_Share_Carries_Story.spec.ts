import { test } from '../../../src/fixtures';
const CASE = '[TC-SHR-001] WhatsApp share carries the headline and the story link';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.verifyWhatsAppShareCarriesStory(articlePath);
});

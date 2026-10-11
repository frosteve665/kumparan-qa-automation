import { test } from '../../../src/fixtures';
import { SHARE_MENU_CHANNELS } from '../../../src/data/share.data';

const CASE = '[TC-SHR-002] Share menu lists every share channel';

test(CASE, { tag: ['@p2'] }, async ({ article, articlePath }) => {
  await article.open(articlePath);
  await article.openShareMenu();
  await article.verifyShareChannels(SHARE_MENU_CHANNELS);
});

import { test } from '../../../src/fixtures';
import { SHARE_TARGETS } from '../../../src/data/share.data';

const CASE = '[TC-SHR-004] Share from the menu carries the story link';

for (const { channel, host } of SHARE_TARGETS) {
  test(`${CASE}: ${channel}`, { tag: ['@p2'] }, async ({ article, articlePath }) => {
    await article.open(articlePath);
    await article.openShareMenu();
    await article.verifyMenuShare(channel, host, articlePath);
  });
}

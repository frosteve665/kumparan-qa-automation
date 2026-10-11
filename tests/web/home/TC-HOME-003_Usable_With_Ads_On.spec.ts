import { test } from '../../../src/fixtures';
const CASE = '[TC-HOME-003] Homepage stays usable with real ads enabled';

// Every other test blocks ad hosts; this one proves blocking hides nothing.
test.use({ allowAds: true });

test(CASE, { tag: ['@p2'] }, async ({ home }) => {
  await home.open();
  await home.dismissInterstitial();
  await home.verifyShown();
});

import { test } from '../../../src/fixtures';
const CASE = '[TC-NAV-001] Channel menu opens the News channel';

test(CASE, { tag: ['@p2'] }, async ({ home }) => {
  await home.open();
  await home.header.openChannel('News');
  await home.header.verifyChannelShown('News');
});

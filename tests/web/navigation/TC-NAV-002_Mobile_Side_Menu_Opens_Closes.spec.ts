import { test } from '../../../src/fixtures';
const CASE = '[TC-NAV-002] Mobile side menu opens and closes';

test(CASE, { tag: ['@p2', '@mobile-only'] }, async ({ home }) => {
  await home.open();

  await home.header.openSideMenu();
  await home.header.verifySideMenuOpen();

  await home.header.closeSideMenu();
  await home.header.verifySideMenuClosed();
});

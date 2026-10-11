import { test } from '../../../src/fixtures';
const CASE = '[TC-NAV-003] Dark mode switches the theme and survives a reload';

test(CASE, { tag: ['@p3'] }, async ({ home }) => {
  await home.open();
  await home.header.verifyLightMode();

  await home.header.toggleTheme();
  await home.header.verifyDarkMode();

  await home.reload();
  await home.header.verifyDarkMode();
});

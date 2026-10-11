import { test } from '../../../src/fixtures';
const CASE = '[TC-AUTH-001] Login entry point opens the login form';

test(CASE, { tag: ['@p1', '@smoke'] }, async ({ home, login }) => {
  await home.open();
  await home.header.goToLogin();
  await login.verifyShown();
});

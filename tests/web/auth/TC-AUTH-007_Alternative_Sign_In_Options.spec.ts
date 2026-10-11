import { test } from '../../../src/fixtures';
const CASE = '[TC-AUTH-007] Alternative sign-in methods and recovery links are offered';

test(CASE, { tag: ['@p3'] }, async ({ login }) => {
  await login.open();
  await login.verifyAlternativeSignInOptions();
});

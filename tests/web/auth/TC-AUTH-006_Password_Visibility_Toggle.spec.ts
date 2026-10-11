import { test } from '../../../src/fixtures';
import { LOGIN } from '../../../src/data/auth.data';

const CASE = '[TC-AUTH-006] Password visibility toggle reveals and hides the password';

test(CASE, { tag: ['@p3'] }, async ({ login }) => {
  await login.open();
  await login.typePassword(LOGIN.anyPassword);

  await login.togglePasswordVisibility();
  await login.verifyPasswordShownAs('text', LOGIN.anyPassword);

  await login.togglePasswordVisibility();
  await login.verifyPasswordShownAs('password', LOGIN.anyPassword);
});

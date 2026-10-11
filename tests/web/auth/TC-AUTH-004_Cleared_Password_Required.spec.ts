import { test } from '../../../src/fixtures';
import { LOGIN } from '../../../src/data/auth.data';

const CASE = '[TC-AUTH-004] Clearing the password shows a required-field message';

test(CASE, { tag: ['@p2'] }, async ({ login }) => {
  await login.open();
  await login.fill(LOGIN.validFormatEmail, 'x');
  await login.clearPassword();
  await login.verifyPasswordRequiredError();
  await login.verifySubmitDisabled();
});

import { test } from '../../../src/fixtures';
import { INVALID_EMAILS, LOGIN } from '../../../src/data/auth.data';

const CASE = '[TC-AUTH-003] Malformed email is rejected with a format message';

for (const email of INVALID_EMAILS) {
  test(`${CASE}: "${email}"`, { tag: ['@p1'] }, async ({ login }) => {
    await login.open();
    await login.fill(email, LOGIN.anyPassword);
    await login.verifyEmailFormatError();
    await login.verifySubmitDisabled();
  });
}

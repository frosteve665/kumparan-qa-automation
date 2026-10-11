import { test } from '../../../src/fixtures';
import { LOGIN } from '../../../src/data/auth.data';

const CASE = '[TC-AUTH-005] Login is protected by a bot challenge before submit';

test(CASE, { tag: ['@p2'] }, async ({ login }) => {
  await login.open();
  await login.fill(LOGIN.validFormatEmail, LOGIN.anyPassword);

  // A valid-looking form still cannot be sent until a person passes the check.
  await login.verifyBotChallengeShown();
  await login.verifySubmitDisabled();
});

import { test } from '../../../src/fixtures';
const CASE = '[TC-AUTH-002] Submit stays disabled while email and password are empty';

test(CASE, { tag: ['@p1'] }, async ({ login }) => {
  await login.open();
  await login.verifyFormEmpty();
  await login.verifySubmitDisabled();
});

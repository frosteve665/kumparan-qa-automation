import { test, expect } from '../../../src/fixtures';
import { BOUNDARY, INVALID_EMAILS } from '../../../src/data/auth.data';

/**
 * Login form behavior that does not need a successful sign-in. Server-side
 * rejection of a wrong password sits behind the Cloudflare challenge, so it is
 * covered by the human-assisted case TC-AUTH-009 (see login-session.spec.ts).
 */
test.describe('Login form', { tag: '@auth' }, () => {
  test('[TC-AUTH-001] login entry point opens the login form', { tag: ['@smoke', '@p1'] }, async ({ home, login, page }) => {
    await home.open();

    await home.header.goToLogin();

    await expect(page).toHaveURL(/\/login/);
    await expect(login.email).toBeVisible();
    await expect(login.password).toHaveAttribute('type', 'password');
    await expect(login.submit).toBeVisible();
  });

  test('[TC-AUTH-002] submit stays disabled while email and password are empty', { tag: ['@p1'] }, async ({ login }) => {
    await login.open();

    await expect(login.email).toHaveValue('');
    await expect(login.password).toHaveValue('');
    await expect(login.submit).toBeDisabled();
  });

  for (const email of INVALID_EMAILS) {
    test(`[TC-AUTH-003] malformed email "${email}" is rejected with a format message`, { tag: ['@p1'] }, async ({ login }) => {
      await login.open();

      await login.email.fill(email);
      await login.password.fill(BOUNDARY.anyPassword);
      await login.password.blur();

      await expect(login.page.getByText('Harus diisi dengan format email')).toBeVisible();
      await expect(login.submit).toBeDisabled();
    });
  }

  test('[TC-AUTH-004] clearing the password shows a required-field message', { tag: ['@p2'] }, async ({ login }) => {
    await login.open();

    await login.email.fill(BOUNDARY.validFormatEmail);
    await login.password.fill('x');
    await login.password.clear();
    await login.password.blur();

    await expect(login.passwordError).toHaveText('Tidak boleh kosong');
    await expect(login.submit).toBeDisabled();
  });

  test('[TC-AUTH-005] login is protected by a bot challenge before submit', { tag: ['@p2', '@security'] }, async ({ login }) => {
    await login.open();
    await login.fill(BOUNDARY.validFormatEmail, BOUNDARY.anyPassword);

    // A correctly formatted form is still not submittable until a human passes
    // the challenge: credential-stuffing bots cannot reach the login API.
    await expect.poll(() => login.hasBotChallenge(), { message: 'Cloudflare challenge frame present' }).toBe(true);
    await expect(login.submit).toBeDisabled();
  });

  test('[TC-AUTH-006] password visibility toggle reveals and hides the password', { tag: ['@p3'] }, async ({ login }) => {
    await login.open();
    await login.password.fill(BOUNDARY.anyPassword);

    await login.togglePasswordVisibility.click();
    await expect(login.password).toHaveAttribute('type', 'text');
    await expect(login.password).toHaveValue(BOUNDARY.anyPassword);

    await login.togglePasswordVisibility.click();
    await expect(login.password).toHaveAttribute('type', 'password');
  });

  test('[TC-AUTH-007] alternative sign-in methods and recovery links are offered', { tag: ['@p3'] }, async ({ login }) => {
    await login.open();

    for (const option of login.socialLogins) await expect(option).toBeVisible();
    await expect(login.forgotPassword).toBeVisible();
    await expect(login.register).toBeVisible();
  });
});

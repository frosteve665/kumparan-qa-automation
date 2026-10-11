import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly email = this.qa('input-email');
  readonly password = this.qa('input-password');
  readonly submit = this.qa('btn-save');
  readonly forgotPassword = this.qa('btn-forgot-password');
  readonly register = this.qa('btn-register');
  readonly passwordError = this.qa('input-password-errorMessage');
  readonly emailFormatError = this.page.getByText('Harus diisi dengan format email');
  // No data-qa-id, and the icon id flips between "eye" and "eye-off": use the button after the field.
  readonly passwordToggle = this.password.locator('xpath=following::button[1]');
  readonly socialLogins = [this.qa('btn-login-fb'), this.qa('btn-login-google'), this.qa('btn-login-phone')];

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async verifyShown(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.email).toBeVisible();
    await expect(this.password).toHaveAttribute('type', 'password');
    await expect(this.submit).toBeVisible();
  }

  async fill(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.password.blur();
  }

  async typePassword(password: string): Promise<void> {
    await this.password.fill(password);
  }

  async clearPassword(): Promise<void> {
    await this.password.clear();
    await this.password.blur();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }

  async verifyFormEmpty(): Promise<void> {
    await expect(this.email).toHaveValue('');
    await expect(this.password).toHaveValue('');
  }

  async verifySubmitDisabled(): Promise<void> {
    await expect(this.submit).toBeDisabled();
  }

  async verifyEmailFormatError(): Promise<void> {
    await expect(this.emailFormatError).toBeVisible();
  }

  async verifyPasswordRequiredError(): Promise<void> {
    await expect(this.passwordError).toHaveText('Tidak boleh kosong');
  }

  async verifyPasswordShownAs(type: 'text' | 'password', value: string): Promise<void> {
    await expect(this.password).toHaveAttribute('type', type);
    await expect(this.password).toHaveValue(value);
  }

  /** Cloudflare Turnstile sits in a closed shadow root, so its frame is read from the frame tree. */
  async verifyBotChallengeShown(): Promise<void> {
    const hasChallenge = () => this.page.frames().some((f) => f.url().includes('challenges.cloudflare.com'));
    await expect.poll(hasChallenge, { message: 'Cloudflare challenge frame present' }).toBe(true);
  }

  async verifyAlternativeSignInOptions(): Promise<void> {
    for (const option of this.socialLogins) await expect(option).toBeVisible();
    await expect(this.forgotPassword).toBeVisible();
    await expect(this.register).toBeVisible();
  }
}

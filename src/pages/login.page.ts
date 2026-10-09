import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  get email(): Locator { return this.qa('input-email'); }
  get password(): Locator { return this.qa('input-password'); }
  get submit(): Locator { return this.qa('btn-save'); }
  get forgotPassword(): Locator { return this.qa('btn-forgot-password'); }
  get register(): Locator { return this.qa('btn-register'); }
  get passwordError(): Locator { return this.qa('input-password-errorMessage'); }
  get emailError(): Locator { return this.qa('input-email-errorMessage'); }
  /**
   * The show/hide button has no data-qa-id and its icon id flips between
   * "eye" and "eye-off", so anchor on the password field instead: the first
   * button that follows it in the DOM (documented fallback, see docs/automation-strategy.md).
   */
  get togglePasswordVisibility(): Locator { return this.password.locator('xpath=following::button[1]'); }
  get socialLogins(): Locator[] { return ['btn-login-fb', 'btn-login-google', 'btn-login-phone'].map((id) => this.qa(id)); }
  /**
   * Cloudflare Turnstile renders inside a closed shadow root, invisible to
   * locators, so presence is read from the frame tree. It is asserted, never solved.
   */
  hasBotChallenge(): boolean {
    return this.page.frames().some((f) => f.url().includes('challenges.cloudflare.com'));
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async fill(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
  }
}

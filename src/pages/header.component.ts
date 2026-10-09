import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Site header. Desktop shows actions inline; mobile hides them behind the burger menu. */
export class Header extends BasePage {
  get logo(): Locator { return this.qa('hd-logo').first(); }
  get searchEntry(): Locator { return this.isMobile ? this.qa('hd-search') : this.qa('input-search'); }
  get themeToggle(): Locator { return this.isMobile ? this.qa('moon') : this.qa('hd-theme'); }
  get burgerMenu(): Locator { return this.qa('burger-menu'); }

  /** The "Masuk" (log in) entry point. On mobile it lives inside the side menu. */
  get loginEntry(): Locator { return this.isMobile ? this.qa('anchor-login-wrapper') : this.qa('hd-login'); }

  async openSideMenu(): Promise<void> {
    if (!this.isMobile) return;
    // The drawer is always rendered, parked off-screen: "visible" is true even
    // when closed, so wait for it to be inside the viewport instead.
    const drawer = this.qa('close-sidebar');
    await expect(async () => {
      if (!(await drawer.evaluate((el) => el.getBoundingClientRect().left >= 0 && el.getBoundingClientRect().left < innerWidth))) {
        await this.burgerMenu.click({ timeout: 5_000 });
      }
      await expect(drawer).toBeInViewport({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
  }

  async closeSideMenu(): Promise<void> {
    await this.qa('close-sidebar').click();
    await expect(this.qa('close-sidebar')).not.toBeInViewport();
  }

  async goToLogin(): Promise<void> {
    await this.openSideMenu();
    await this.clickUntilUrl(this.loginEntry, /\/login/);
  }

  /** Main channel navigation: desktop menu bar, mobile top-nav strip. */
  channelLink(name: string): Locator {
    return this.isMobile
      ? this.qa('topnav').filter({ hasText: new RegExp(`^${name}$`, 'i') }).first()
      : this.qa('main-menu').getByRole('link', { name, exact: true });
  }

  /**
   * Dark-mode switch. Desktop: header button. Mobile: a switch inside the
   * side menu (the drawer is opened first).
   */
  async toggleTheme(): Promise<void> {
    if (this.isMobile) {
      await this.openSideMenu();
      // The switch is a visually hidden <input type="checkbox"> styled as a
      // toggle, in the "Mode Gelap" row (no data-qa-id on the input itself).
      const row = this.page.locator('div').filter({ has: this.qa('moon') }).filter({ hasText: 'Mode Gelap' }).last();
      // Dispatch on the input itself: the styled track overlays it, and the
      // drawer may still be sliding in, so a coordinate click is unreliable.
      await row.locator('input[type="checkbox"]').dispatchEvent('click');
    } else {
      await this.waitForInteractive(this.qa('hd-theme'));
      await this.qa('hd-theme').click();
    }
  }

  async search(term: string): Promise<void> {
    if (this.isMobile) await this.clickUntilUrl(this.qa('hd-search'), /\/search/);
    const input = this.qa('input-search').first();
    // Before the app is interactive, Enter submits the plain HTML form and
    // lands on /?desktop-search=… with no results (OBS-002, caused by BUG-003).
    await this.waitForInteractive(input);
    await input.fill(term);
    await input.press('Enter');
  }
}

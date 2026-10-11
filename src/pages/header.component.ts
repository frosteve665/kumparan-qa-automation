import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

const DARK_BACKGROUND = 'rgb(24, 24, 24)';

/** Site header. Desktop shows actions inline; mobile keeps them in the burger menu. */
export class Header extends BasePage {
  readonly logo = this.qa('hd-logo').first();
  readonly burgerMenu = this.qa('burger-menu');
  readonly sideMenuClose = this.qa('close-sidebar');
  readonly searchEntry = this.isMobile ? this.qa('hd-search') : this.qa('input-search');
  readonly searchInput = this.qa('input-search').first();
  readonly loginEntry = this.isMobile ? this.qa('anchor-login-wrapper') : this.qa('hd-login');
  readonly darkModeLabel = this.page.getByText('Mode Gelap');

  async verifyShown(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.isMobile ? this.burgerMenu : this.loginEntry).toBeVisible();
  }

  async verifyLogoShown(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async openSideMenu(): Promise<void> {
    if (!this.isMobile) return;
    // The drawer is always rendered, parked off-screen, so "visible" is true even when closed.
    await expect(async () => {
      const onScreen = await this.sideMenuClose.evaluate((el) => {
        const left = el.getBoundingClientRect().left;
        return left >= 0 && left < innerWidth;
      });
      if (!onScreen) await this.burgerMenu.click({ timeout: 5_000 });
      await expect(this.sideMenuClose).toBeInViewport({ timeout: 3_000 });
    }).toPass({ timeout: 30_000 });
  }

  async closeSideMenu(): Promise<void> {
    await this.sideMenuClose.click();
  }

  async verifySideMenuOpen(): Promise<void> {
    await expect(this.sideMenuClose).toBeInViewport();
    await expect(this.darkModeLabel).toBeInViewport();
  }

  async verifySideMenuClosed(): Promise<void> {
    await expect(this.darkModeLabel).not.toBeInViewport();
  }

  async goToLogin(): Promise<void> {
    await this.openSideMenu();
    await this.clickUntilUrl(this.loginEntry, /\/login/);
  }

  /** Channel navigation: desktop menu bar, mobile top-nav strip. */
  channelLink(name: string): Locator {
    return this.isMobile
      ? this.qa('topnav')
          .filter({ hasText: new RegExp(`^${name}$`, 'i') })
          .first()
      : this.qa('main-menu').getByRole('link', { name, exact: true });
  }

  async openChannel(name: string): Promise<void> {
    await this.clickUntilUrl(this.channelLink(name), new RegExp(`/channel/${name.toLowerCase()}`));
  }

  async verifyChannelShown(name: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/channel/${name.toLowerCase()}$`));
    await expect(this.qa('channel-title').or(this.qa('news-card')).first()).toBeVisible();
  }

  async toggleTheme(): Promise<void> {
    if (this.isMobile) {
      await this.openSideMenu();
      // The switch is a hidden checkbox styled as a toggle in the "Mode Gelap" row (no data-qa-id).
      // Dispatching on the input avoids hitting the styled track while the drawer slides in.
      const row = this.page
        .locator('div')
        .filter({ has: this.qa('moon') })
        .filter({ hasText: 'Mode Gelap' })
        .last();
      await row.locator('input[type="checkbox"]').dispatchEvent('click');
    } else {
      await this.waitForInteractive(this.qa('hd-theme'));
      await this.qa('hd-theme').click();
    }
  }

  async verifyDarkMode(): Promise<void> {
    await expect(this.page.locator('body')).toHaveCSS('background-color', DARK_BACKGROUND);
    expect(await this.page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
  }

  async verifyLightMode(): Promise<void> {
    expect(await this.page.evaluate(() => localStorage.getItem('theme'))).not.toBe('dark');
  }

  async search(term: string): Promise<void> {
    if (this.isMobile) await this.clickUntilUrl(this.qa('hd-search'), /\/search/);
    // Before the app is interactive, Enter submits the plain form to /?desktop-search= (OBS-002).
    await this.waitForInteractive(this.searchInput);
    await this.searchInput.fill(term);
    await this.searchInput.press('Enter');
  }

  async submitEmptySearch(): Promise<void> {
    if (this.isMobile) await this.clickUntilUrl(this.qa('hd-search'), /\/search/);
    await this.waitForInteractive(this.searchInput);
    await this.searchInput.press('Enter');
  }
}

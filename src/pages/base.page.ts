import { expect, type Locator, type Page } from '@playwright/test';
import type { Platform } from '../config/platform';
import { captionStep } from '../support/caption';

export abstract class BasePage {
  constructor(readonly page: Page, protected readonly platform: Platform) {}

  /** Primary locator strategy: the data-qa-id attribute (configured as testIdAttribute). */
  protected qa(id: string): Locator {
    return this.page.getByTestId(id);
  }

  protected get isMobile(): boolean {
    return this.platform === 'mobile';
  }

  /** Shows the current step in the video caption. */
  async step(text: string): Promise<void> {
    await captionStep(this.page, text);
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.step(`Open ${path.length > 60 ? `${path.slice(0, 57)}…` : path}`);
    await this.dismissInterstitial();
  }

  /**
   * Waits until React has attached its event handlers to the element.
   * kumparan renders markup first and wires behavior a moment later; a click
   * in between toggles native state (a checkbox ticks) without the app
   * noticing. React marks wired elements with __reactProps$<id>.
   */
  async waitForInteractive(target: Locator): Promise<void> {
    await target.first().waitFor();
    await expect
      .poll(() => target.first().evaluate((el) => Object.keys(el).some((k) => k.startsWith('__reactProps'))), { message: 'element wired by React', timeout: 15_000 })
      .toBe(true);
  }

  /**
   * Clicks until the URL matches. Long articles re-render while scrolling
   * (the URL switches to /full), which can swallow a single click.
   */
  async clickUntilUrl(target: Locator, url: RegExp): Promise<void> {
    await this.step(`Tap ${await describe(target)} → expect ${url.source.replaceAll('\\', '')}`);
    await expect(async () => {
      if (!url.test(this.page.url())) await target.click({ timeout: 5_000 });
      await expect(this.page).toHaveURL(url, { timeout: 4_000 });
    }).toPass({ timeout: 30_000 });
  }

  /** Clicks until the expected element is visible (same retry rationale as clickUntilUrl). */
  async clickUntilVisible(target: Locator, expected: Locator): Promise<void> {
    await this.step(`Tap ${await describe(target)}`);
    await expect(async () => {
      if (!(await expected.isVisible())) await target.click({ timeout: 5_000 });
      await expect(expected).toBeVisible({ timeout: 4_000 });
    }).toPass({ timeout: 30_000 });
  }

  /** The full-screen ad interstitial can cover the page; close it when present. */
  async dismissInterstitial(): Promise<void> {
    const close = this.qa('otp-ads-close-modal-btn');
    if (await close.isVisible().catch(() => false)) await close.click({ timeout: 2_000 }).catch(() => undefined);
  }
}

/** Human label for a locator in the caption: its data-qa-id, else its text. */
async function describe(target: Locator): Promise<string> {
  return target.first().evaluate((el) => el.getAttribute('data-qa-id') ?? (el.textContent ?? '').trim().slice(0, 30)).catch(() => 'element');
}

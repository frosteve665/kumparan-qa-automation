import { expect } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  readonly input = this.qa('input-search').first();
  readonly results = this.qa('story-result-card');
  readonly resultTitles = this.results.getByTestId('title');
  readonly notFound = this.page.getByText('Story tidak ditemukan');
  // The sort toggles swap ids between "-active" and "-non-active" when selected.
  readonly relevantActive = this.qa('relevant-active');
  readonly relevantInactive = this.qa('relevant-non-active');
  readonly newestActive = this.qa('newest-active');
  readonly newestInactive = this.qa('newest-non-active');

  /** Opens search (optionally with a term) and returns the HTTP status. */
  async open(term?: string): Promise<number> {
    const status = await this.goto(term === undefined ? '/search' : `/search/${encodeURIComponent(term)}`);
    await this.waitForInteractive(this.input);
    return status;
  }

  async openTab(tabId: string): Promise<void> {
    await this.qa(tabId).click();
  }

  async sortByNewest(): Promise<void> {
    await expect(this.relevantActive).toBeVisible();
    await this.newestInactive.click();
  }

  async verifyUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async verifyResultsMention(keyword: string): Promise<void> {
    await expect(this.results.first()).toBeVisible();
    const titles = (await this.resultTitles.allInnerTexts()).slice(0, 10).join(' ').toLowerCase();
    expect(titles).toContain(keyword);
  }

  async verifyResultsShown(): Promise<void> {
    await expect(this.results.first()).toBeVisible();
  }

  async verifyTabResults(cardId: string): Promise<void> {
    await expect(this.qa(cardId).first()).toBeVisible();
  }

  async verifySortedByNewest(): Promise<void> {
    await expect(this.newestActive).toBeVisible();
    await expect(this.relevantInactive).toBeVisible();
    await expect(this.results.first()).toBeVisible();
  }

  async verifyNotFound(): Promise<void> {
    await expect(this.results).toHaveCount(0);
    await expect(this.notFound).toBeVisible();
  }

  async verifyResultsOrNotFound(): Promise<void> {
    await expect(this.results.first().or(this.notFound)).toBeVisible();
  }

  async verifyLandingPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/search\/?$/);
    await expect(this.results).toHaveCount(0);
  }

  /** The text must show up as text, never as a real <b> element. */
  async verifyNotRenderedAsHtml(text: string): Promise<void> {
    await this.verifyResultsOrNotFound();
    await expect(this.page.locator('b', { hasText: text })).toHaveCount(0);
  }
}

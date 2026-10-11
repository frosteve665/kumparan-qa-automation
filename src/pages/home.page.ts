import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Header } from './header.component';

export class HomePage extends BasePage {
  readonly header = new Header(this.page, this.platform);
  readonly root = this.qa('homepage');
  readonly headlineCards = this.qa('headline-card');
  readonly storyTitles = this.root.getByTestId('title');
  readonly trendingLoadMore = this.qa('trending-section').getByTestId('ft-loadmore');
  readonly topNavTrending = this.qa('nb-trending');
  readonly trendingStories = this.qa('trending-stories-card');

  async open(): Promise<void> {
    await this.goto('/');
  }

  async verifyShown(): Promise<void> {
    await this.header.verifyShown();
    await expect(this.headlineCards.first()).toBeVisible();
    expect(await this.headlineCards.count()).toBeGreaterThanOrEqual(3);
    await expect(this.storyTitles.first()).not.toBeEmpty();
  }

  async verifyIsHomepage(): Promise<void> {
    await expect(this.page).toHaveURL(/kumparan\.com\/?$/);
    await expect(this.headlineCards.first()).toBeVisible();
  }

  /** Opens the first headline and returns its card title. */
  async openFirstHeadline(): Promise<string> {
    const title = this.headlineCards.first().getByTestId('title').first();
    const text = (await title.innerText()).trim();
    await title.click();
    return text;
  }

  /** Desktop: "Lihat lainnya" under Trending. Mobile: "Trending" in the top-nav strip. */
  async openTrending(): Promise<void> {
    await this.clickUntilUrl(this.isMobile ? this.topNavTrending : this.trendingLoadMore, /\/trending/);
  }

  async verifyTrendingShown(): Promise<void> {
    await expect(this.trendingStories.first()).toBeVisible();
  }

  /** Opens the homepage and returns the uncaught errors the page itself throws. */
  async openCollectingErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('pageerror', (err) => errors.push(err.message));
    await this.open();
    await expect(this.headlineCards.first()).toBeVisible();
    return errors;
  }
}

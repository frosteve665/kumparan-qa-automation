import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Header } from './header.component';

export class HomePage extends BasePage {
  readonly header = new Header(this.page, this.platform);

  get root(): Locator { return this.qa('homepage'); }
  get headlineCards(): Locator { return this.qa('headline-card'); }
  get storyTitles(): Locator { return this.root.getByTestId('title'); }
  get loadMore(): Locator { return this.qa('ft-loadmore').first(); }

  async open(): Promise<void> {
    await this.goto('/');
  }
}

import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class SearchPage extends BasePage {
  get input(): Locator { return this.qa('input-search').first(); }
  get results(): Locator { return this.qa('story-result-card'); }
  get resultTitles(): Locator { return this.results.getByTestId('title'); }
  get popularSearches(): Locator { return this.qa('popular-search-section'); }
  /** Empty state: "Story tidak ditemukan". */
  get notFound(): Locator { return this.page.getByText('Story tidak ditemukan'); }

  /** Sort toggles swap ids between "-active" and "-non-active" when selected. */
  get sortRelevant() { return { active: this.qa('relevant-active'), inactive: this.qa('relevant-non-active') }; }
  get sortNewest() { return { active: this.qa('newest-active'), inactive: this.qa('newest-non-active') }; }

  tab(id: string): Locator { return this.qa(id); }

  async open(term?: string): Promise<void> {
    await this.goto(term === undefined ? '/search' : `/search/${encodeURIComponent(term)}`);
    await this.waitForInteractive(this.input);
  }
}

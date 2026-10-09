import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** /<channel>/response/<slug>: the comment thread of a story. */
export class CommentPage extends BasePage {
  get commentedStory(): Locator { return this.qa('selected-commented-card'); }
  get section(): Locator { return this.qa('comment-section').first(); }
  get inputCard(): Locator { return this.qa('comment-input-card'); }
  get input(): Locator { return this.qa('input-comment'); }
  /** The textarea inside the input wrapper. It has no data-qa-id; its id is stable and unique. */
  get editor(): Locator { return this.input.locator('textarea#comment-editor'); }
  /** Asserted only: tests never click it (assignment rule: do not submit comments). */
  get sendButton(): Locator { return this.qa('btn-send-comment'); }
  get emptyState(): Locator { return this.qa('no-comment'); }
}

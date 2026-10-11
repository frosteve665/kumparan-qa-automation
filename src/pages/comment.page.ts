import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/** /<channel>/response/<slug>: the comment thread of a story. */
export class CommentPage extends BasePage {
  readonly commentedStory = this.qa('selected-commented-card');
  readonly section = this.qa('comment-section').first();
  readonly input = this.qa('input-comment');
  // No data-qa-id on the textarea itself; its id is stable and unique.
  readonly editor = this.input.locator('textarea#comment-editor');
  readonly sendButton = this.qa('btn-send-comment');
  readonly emptyState = this.qa('no-comment');

  async verifyThreadFor(headline: string, articlePath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/response/${articlePath.split('/').pop()}`));
    await expect(this.commentedStory).toContainText(headline.slice(0, 30));
    await expect(this.editor).toHaveAttribute('placeholder', 'Tulis komentar...');
    await expect(this.sendButton).toBeVisible();
  }

  async verifyCommentCount(count: number): Promise<void> {
    await expect(this.section).toContainText(`${count} Komentar`);
    if (count === 0) await expect(this.emptyState).toHaveText(/Belum ada komentar/);
  }

  /** Types into the editor. Never sends: the send button is not clicked anywhere in the suite. */
  async typeComment(text: string): Promise<void> {
    await this.editor.fill(text);
  }

  async verifyDraft(text: string): Promise<void> {
    await expect(this.editor).toHaveValue(text);
    await expect(this.page).toHaveURL(/\/response\//);
  }

  /** Records comment mutations sent while the returned stop function is pending. */
  watchCommentWrites(): () => string[] {
    const writes: string[] = [];
    const onRequest = (r: import('@playwright/test').Request) => {
      const body = r.postData() ?? '';
      const op = /"operationName"\s*:\s*"(\w+)"/.exec(body)?.[1];
      if (op && /comment|response/i.test(op) && /\bmutation\b/.test(body)) writes.push(op);
    };
    this.page.on('request', onRequest);
    return () => {
      this.page.off('request', onRequest);
      return writes;
    };
  }
}

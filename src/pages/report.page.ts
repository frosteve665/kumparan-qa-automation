import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { expectUrlStays } from '../support/assertions';
import { REPORT_REASONS } from '../data/report.data';

/** /report/story/<slug>: the "Laporkan Konten" form. Its submit button is never clicked. */
export class ReportPage extends BasePage {
  readonly reportedStory = this.qa('news-item');
  readonly cancelButton = this.qa('btn-cancel');
  readonly otherReasonField = this.qa('input-report');
  readonly otherReasonText = this.otherReasonField
    .locator('textarea, input')
    .or(this.page.locator('textarea[data-qa-id="input-report"], input[data-qa-id="input-report"]'))
    .first();

  /** The innermost block that holds both the reasons and the Cancel button. */
  readonly form = this.page
    .locator('div')
    .filter({ has: this.reason(0) })
    .filter({ has: this.qa('btn-cancel') })
    .last();

  /** Submit shares its data-qa-id with the story's "report" link, so it is scoped to the form. */
  readonly submitButton = this.form.getByTestId('btn-report');

  reason(index: number): Locator {
    return this.qa(`radio-btn-option-report-${index}`);
  }

  /** Named "radio" but built as <input type="checkbox">: single choice is enforced by script. */
  reasonInput(index: number): Locator {
    return this.reason(index).locator('input');
  }

  async open(articlePath: string): Promise<void> {
    await this.goto(`/report/story/${articlePath.split('/').pop()}`);
    await this.waitForInteractive(this.reason(0));
  }

  /** Opens the form for any slug (e.g. a story that does not exist) and returns the HTTP status. */
  async openForSlug(slug: string): Promise<number> {
    return this.goto(`/report/story/${slug}`);
  }

  async verifyNoStoryShown(status: number): Promise<void> {
    expect(status, 'no server error').toBeLessThan(500);
    await expect(this.page.locator('body')).not.toBeEmpty();
    if (status === 200) await expect(this.reportedStory).toBeHidden();
  }

  async verifyFormShown(): Promise<void> {
    await expect(this.form).toBeVisible();
  }

  async verifyShownFor(headline: string): Promise<void> {
    await expect(this.form).toContainText('Laporkan Konten');
    await expect(this.reportedStory).toContainText(headline.slice(0, 30));
  }

  async verifyAllReasons(): Promise<void> {
    for (const [index, reason] of REPORT_REASONS.entries()) {
      await expect(this.reason(index)).toBeVisible();
      await expect(this.form.getByText(reason, { exact: true })).toBeVisible();
    }
  }

  async selectReason(index: number): Promise<void> {
    await this.waitForInteractive(this.reason(index));
    await this.reason(index).click();
    await expect(this.reasonInput(index)).toBeChecked();
  }

  async verifyOnlySelected(index: number, notSelected: number): Promise<void> {
    await expect(this.reasonInput(index)).toBeChecked();
    await expect(this.reasonInput(notSelected)).not.toBeChecked();
  }

  async writeOtherReason(text: string): Promise<void> {
    await this.otherReasonText.fill(text);
  }

  async cancel(): Promise<void> {
    await this.step('Tap "Batal"');
    await this.cancelButton.click();
  }

  async verifySubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }

  async verifySubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
    await expect(this.submitButton).toBeDisabled();
  }

  async verifyOtherReasonFieldShown(): Promise<void> {
    await expect(this.otherReasonField).toBeVisible();
  }

  async verifyOtherReasonFieldHidden(): Promise<void> {
    await expect(this.otherReasonField).toBeHidden();
  }

  async verifyFormClosed(): Promise<void> {
    await expect(this.reason(0)).toBeHidden({ timeout: 5_000 });
  }

  /** Watches the address bar for 8 s: the stray rewrite to the story can arrive a few seconds late. */
  async verifyUrlStaysOnForm(): Promise<void> {
    await expectUrlStays(this.page, /\/report\/story\//, 8_000);
  }
}

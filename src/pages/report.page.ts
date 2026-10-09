import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

export const REPORT_REASONS = [
  'Spam, Komersial, atau Iklan',
  'Memiliki unsur pornografi',
  'Membahayakan atau menjurus tindakan berbahaya',
  'Mengandung konten kekerasan',
  'Menyinggung SARA',
  'Lainnya',
] as const;

/** /report/story/<slug>: the "Laporkan Konten" form. */
export class ReportPage extends BasePage {
  get reportedStory(): Locator { return this.qa('news-item'); }
  /** The report form: the innermost block holding both the reasons and the Cancel button. */
  get form(): Locator {
    return this.page.locator('div').filter({ has: this.reason(0) }).filter({ has: this.qa('btn-cancel') }).last();
  }
  get cancelButton(): Locator { return this.qa('btn-cancel'); }
  /** Free-text field revealed by the "Lainnya" (Other) reason. */
  get otherReasonInput(): Locator { return this.qa('input-report'); }
  /** The typeable element inside the free-text field (it may be the field itself). */
  get otherReasonText(): Locator { return this.otherReasonInput.locator('textarea, input').or(this.page.locator('textarea[data-qa-id="input-report"], input[data-qa-id="input-report"]')).first(); }
  /**
   * The SUBMIT button. Same data-qa-id as the article's "report" entry point,
   * so it is scoped to the form. Asserted only, never clicked (assignment rule).
   */
  get submitButton(): Locator { return this.form.getByTestId('btn-report'); }

  /** The clickable label of a reason. */
  reason(index: number): Locator { return this.qa(`radio-btn-option-report-${index}`); }
  /**
   * The control inside a reason. Named "radio-btn" but implemented as
   * <input type="checkbox">: single choice is enforced by script, not by HTML.
   */
  radio(index: number): Locator { return this.reason(index).locator('input'); }

  async open(articlePath: string): Promise<void> {
    await this.goto(`/report/story/${articlePath.split('/').pop()}`);
    await this.waitForInteractive(this.reason(0));
  }

  async selectReason(index: number): Promise<void> {
    await this.waitForInteractive(this.reason(index));
    await this.reason(index).click();
    await expect(this.radio(index)).toBeChecked();
  }
}

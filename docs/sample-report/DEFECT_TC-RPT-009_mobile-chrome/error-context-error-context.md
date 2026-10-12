# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\report\TC-RPT-009_Cancel_In_New_Tab_Leaves_Form.spec.ts >> [TC-RPT-009] "Batal" on a report link opened in a new tab takes the reader out of the form
- Location: tests\web\report\TC-RPT-009_Cancel_In_New_Tab_Leaves_Form.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByTestId('radio-btn-option-report-0')
Expected: hidden
Received: visible
Timeout:  5000ms

Call log:
  - Expect "toBeHidden" getByTestId('radio-btn-option-report-0') with timeout 5000ms
  - waiting for getByTestId('radio-btn-option-report-0')
    12 × locator resolved to <label data-qa-id="radio-btn-option-report-0" class="Radioweb__RadioContainer-sc-1qgslsf-2 eLreDk">…</label>
       - unexpected value "visible"

```

```yaml
- text: Spam, Komersial, atau Iklan
- checkbox "Spam, Komersial, atau Iklan"
```

# Test source

```ts
  5   | 
  6   | /** /report/story/<slug>: the "Laporkan Konten" form. Its submit button is never clicked. */
  7   | export class ReportPage extends BasePage {
  8   |   readonly reportedStory = this.qa('news-item');
  9   |   readonly cancelButton = this.qa('btn-cancel');
  10  |   readonly otherReasonField = this.qa('input-report');
  11  |   readonly otherReasonText = this.otherReasonField
  12  |     .locator('textarea, input')
  13  |     .or(this.page.locator('textarea[data-qa-id="input-report"], input[data-qa-id="input-report"]'))
  14  |     .first();
  15  | 
  16  |   /** The innermost block that holds both the reasons and the Cancel button. */
  17  |   readonly form = this.page
  18  |     .locator('div')
  19  |     .filter({ has: this.reason(0) })
  20  |     .filter({ has: this.qa('btn-cancel') })
  21  |     .last();
  22  | 
  23  |   /** Submit shares its data-qa-id with the story's "report" link, so it is scoped to the form. */
  24  |   readonly submitButton = this.form.getByTestId('btn-report');
  25  | 
  26  |   reason(index: number): Locator {
  27  |     return this.qa(`radio-btn-option-report-${index}`);
  28  |   }
  29  | 
  30  |   /** Named "radio" but built as <input type="checkbox">: single choice is enforced by script. */
  31  |   reasonInput(index: number): Locator {
  32  |     return this.reason(index).locator('input');
  33  |   }
  34  | 
  35  |   async open(articlePath: string): Promise<void> {
  36  |     await this.goto(`/report/story/${articlePath.split('/').pop()}`);
  37  |     await this.waitForInteractive(this.reason(0));
  38  |   }
  39  | 
  40  |   /** Opens the form for any slug (e.g. a story that does not exist) and returns the HTTP status. */
  41  |   async openForSlug(slug: string): Promise<number> {
  42  |     return this.goto(`/report/story/${slug}`);
  43  |   }
  44  | 
  45  |   async verifyNoStoryShown(status: number): Promise<void> {
  46  |     expect(status, 'no server error').toBeLessThan(500);
  47  |     await expect(this.page.locator('body')).not.toBeEmpty();
  48  |     if (status === 200) await expect(this.reportedStory).toBeHidden();
  49  |   }
  50  | 
  51  |   async verifyFormShown(): Promise<void> {
  52  |     await expect(this.form).toBeVisible();
  53  |   }
  54  | 
  55  |   async verifyShownFor(headline: string): Promise<void> {
  56  |     await expect(this.form).toContainText('Laporkan Konten');
  57  |     await expect(this.reportedStory).toContainText(headline.slice(0, 30));
  58  |   }
  59  | 
  60  |   async verifyAllReasons(): Promise<void> {
  61  |     for (const [index, reason] of REPORT_REASONS.entries()) {
  62  |       await expect(this.reason(index)).toBeVisible();
  63  |       await expect(this.form.getByText(reason, { exact: true })).toBeVisible();
  64  |     }
  65  |   }
  66  | 
  67  |   async selectReason(index: number): Promise<void> {
  68  |     await this.waitForInteractive(this.reason(index));
  69  |     await this.reason(index).click();
  70  |     await expect(this.reasonInput(index)).toBeChecked();
  71  |   }
  72  | 
  73  |   async verifyOnlySelected(index: number, notSelected: number): Promise<void> {
  74  |     await expect(this.reasonInput(index)).toBeChecked();
  75  |     await expect(this.reasonInput(notSelected)).not.toBeChecked();
  76  |   }
  77  | 
  78  |   async writeOtherReason(text: string): Promise<void> {
  79  |     await this.otherReasonText.fill(text);
  80  |   }
  81  | 
  82  |   async cancel(): Promise<void> {
  83  |     await this.step('Tap "Batal"');
  84  |     await this.cancelButton.click();
  85  |   }
  86  | 
  87  |   async verifySubmitEnabled(): Promise<void> {
  88  |     await expect(this.submitButton).toBeEnabled();
  89  |   }
  90  | 
  91  |   async verifySubmitDisabled(): Promise<void> {
  92  |     await expect(this.submitButton).toBeVisible();
  93  |     await expect(this.submitButton).toBeDisabled();
  94  |   }
  95  | 
  96  |   async verifyOtherReasonFieldShown(): Promise<void> {
  97  |     await expect(this.otherReasonField).toBeVisible();
  98  |   }
  99  | 
  100 |   async verifyOtherReasonFieldHidden(): Promise<void> {
  101 |     await expect(this.otherReasonField).toBeHidden();
  102 |   }
  103 | 
  104 |   async verifyFormClosed(): Promise<void> {
> 105 |     await expect(this.reason(0)).toBeHidden({ timeout: 5_000 });
      |                                  ^ Error: expect(locator).toBeHidden() failed
  106 |   }
  107 | 
  108 |   /** Watches the address bar for 8 s: the stray rewrite to the story can arrive a few seconds late. */
  109 |   async verifyUrlStaysOnForm(): Promise<void> {
  110 |     await expectUrlStays(this.page, /\/report\/story\//, 8_000);
  111 |   }
  112 | }
  113 | 
```
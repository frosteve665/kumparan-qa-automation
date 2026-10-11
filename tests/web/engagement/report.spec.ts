import { test, expect } from '../../../src/fixtures';
import { REPORT_REASONS } from '../../../src/pages/report.page';
import { expectUrlStays } from '../../../src/support/assertions';

/** "Laporkan Konten". The submit button is asserted, never clicked. */
test.describe('Report a story', { tag: '@report' }, () => {
  test('[TC-RPT-001] report opens "Laporkan Konten" with six reasons', { tag: ['@p1', '@positive'] }, async ({ article, articlePath, report, page }) => {
    await article.open(articlePath);
    const headline = (await article.title.innerText()).trim();

    await article.openReport();

    await expect(report.form).toContainText('Laporkan Konten');
    await expect(report.reportedStory).toContainText(headline.slice(0, 30));
    for (const [index, reason] of REPORT_REASONS.entries()) {
      await expect(report.reason(index)).toBeVisible();
      await expect(report.form.getByText(reason, { exact: true })).toBeVisible();
    }
  });

  // "Lainnya" (index 5) also needs a written reason: covered by TC-RPT-010/011.
  for (const [index, reason] of REPORT_REASONS.slice(0, 5).entries()) {
    test(`[TC-RPT-002] reason "${reason}" can be selected and enables submit`, { tag: ['@p1', '@positive'] }, async ({ report, articlePath }) => {
      await report.open(articlePath);

      await report.selectReason(index);

      await expect(report.submitButton).toBeEnabled();
    });
  }

  test('[TC-RPT-003] submit stays disabled until a reason is chosen', { tag: ['@p1', '@negative', '@state'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);

    await expect(report.submitButton).toBeVisible();
    await expect(report.submitButton).toBeDisabled();
  });

  test('[TC-RPT-004] cancel from the story returns to the story without reporting', { tag: ['@p2', '@negative'] }, async ({ article, articlePath, report, page }) => {
    await article.open(articlePath);
    await article.openReport();
    await report.selectReason(0);

    await report.cancelButton.click();

    await expect(page).toHaveURL(new RegExp(`${articlePath.split('/').pop()}`));
    await expect(article.title).toBeVisible();
  });

  test('[TC-RPT-005] only one reason can be selected at a time', { tag: ['@p2', '@boundary'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);

    await report.selectReason(0);
    await report.selectReason(3);

    await expect(report.radio(3)).toBeChecked();
    await expect(report.radio(0)).not.toBeChecked();
  });

  test('[TC-RPT-006] "Lainnya" reveals a free-text field for the reason', { tag: ['@p3', '@edge'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);
    await expect(report.otherReasonInput).toBeHidden();

    await report.selectReason(5);

    await expect(report.otherReasonInput).toBeVisible();
  });

  test('[TC-RPT-010] "Lainnya" with an empty reason cannot be submitted', { tag: ['@p2', '@boundary', '@negative'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);

    await report.selectReason(5);
    await expect(report.otherReasonInput).toBeVisible();

    await expect(report.submitButton).toBeDisabled();
  });

  test('[TC-RPT-011] "Lainnya" becomes submittable once a reason is written', { tag: ['@p2', '@boundary', '@positive'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);
    await report.selectReason(5);

    await report.otherReasonText.fill('Judul tidak sesuai isi berita');

    await expect(report.submitButton).toBeEnabled();
  });

  test('[TC-RPT-007] guest can complete the report form up to submit', { tag: ['@p1', '@edge', '@authorization'] }, async ({ report, articlePath, header }) => {
    // Observation test: kumparan lets a guest reach an enabled "Laporkan".
    // Whether submitting then requires login cannot be verified without
    // submitting, which the assignment forbids: documented in docs/test-plan.md.
    await report.open(articlePath);
    await expect(header.loginEntry.or(header.burgerMenu).first()).toBeVisible();

    await report.selectReason(0);

    await expect(report.submitButton).toBeEnabled();
  });

  test('[TC-RPT-008] report link for a missing story is handled cleanly', { tag: ['@p3', '@edge', '@error-handling'] }, async ({ page, report }) => {
    const response = await page.goto('/report/story/qa-automation-story-that-does-not-exist-00000000000', { waitUntil: 'domcontentloaded' });

    // Either a 404 or a form without a story; never a crash or a blank page.
    const status = response?.status() ?? 0;
    expect(status, 'no server error').toBeLessThan(500);
    await expect(page.locator('body')).not.toBeEmpty();
    if (status === 200) await expect(report.reportedStory).toBeHidden();
  });

  test('[TC-RPT-009] "Batal" on a report link opened in a new tab takes the reader out of the form', {
    tag: ['@p2', '@edge', '@defect'],
    annotation: { type: 'issue', description: 'BUG-001: "Batal" only calls history.back(): dead button on a shared link in a new tab' },
  }, async ({ page, context, articlePath }) => {
    test.fail(true, 'Known defect BUG-001 still reproduces');
    // Real-user path: a shared report link opened in a new tab. The new tab has
    // no history of its own (history.length === 1), unlike a Playwright page,
    // whose first entry is about:blank and would hide what users actually see.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const newTab = context.waitForEvent('page');
    await page.evaluate((url) => window.open(url, '_blank'), `/report/story/${articlePath.split('/').pop()}`);
    const tab = await newTab;
    const cancel = tab.getByTestId('btn-cancel');
    await tab.getByTestId('radio-btn-option-report-0').waitFor();
    expect(await tab.evaluate(() => history.length)).toBe(1);

    await cancel.click();

    // Expected: the reader leaves the form (e.g. to the story). Actual: nothing happens.
    await expect(tab.getByTestId('radio-btn-option-report-0')).toBeHidden({ timeout: 5_000 });
  });

  test('[TC-RPT-012] keyboard user opening the report form keeps the form URL in the address bar', {
    tag: ['@p3', '@edge', '@defect', '@a11y', '@desktop-only'],
    annotation: { type: 'issue', description: 'BUG-002: address bar switches back to the story (/full) while the report form is shown (keyboard path)' },
  }, async ({ article, articlePath, report, page }) => {
    // Verified 2026-10-11 in Google Chrome: 3/3 via keyboard on desktop, 0/6 with
    // mouse-wheel or End-key scrolling. Desktop only: mobile has no keyboard path.
    test.fail(true, 'Known defect BUG-002 still reproduces');
    await article.open(articlePath);
    const reportLink = article.reportButton;
    await article.waitForInteractive(reportLink);

    // A keyboard user reaches "Laporkan tulisan" (focus scrolls the page to it) and presses Enter.
    await reportLink.focus();
    await page.keyboard.press('Enter');
    await expect(report.form).toBeVisible();

    // Refresh, bookmark or share must lead back to the form the user sees,
    // so the URL has to *stay* on /report/story/, not just pass through it.
    await expectUrlStays(page, /\/report\/story\//, 4_000);
  });
});

import { test } from '../../../src/fixtures';
import { REPORT_REASONS } from '../../../src/data/report.data';

const CASE = '[TC-RPT-002] Reason can be selected and enables submit';

// "Lainnya" also needs a written reason: TC-RPT-010 and TC-RPT-011.
for (const [index, reason] of REPORT_REASONS.slice(0, 5).entries()) {
  test(`${CASE}: "${reason}"`, { tag: ['@p1'] }, async ({ report, articlePath }) => {
    await report.open(articlePath);
    await report.selectReason(index);
    await report.verifySubmitEnabled();
  });
}

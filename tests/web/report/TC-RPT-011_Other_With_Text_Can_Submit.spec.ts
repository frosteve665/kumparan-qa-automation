import { test } from '../../../src/fixtures';
import { OTHER_REASON, REPORT } from '../../../src/data/report.data';

const CASE = '[TC-RPT-011] "Lainnya" becomes submittable once a reason is written';

test(CASE, { tag: ['@p2'] }, async ({ report, articlePath }) => {
  await report.open(articlePath);
  await report.selectReason(OTHER_REASON);
  await report.writeOtherReason(REPORT.otherReasonText);
  await report.verifySubmitEnabled();
});

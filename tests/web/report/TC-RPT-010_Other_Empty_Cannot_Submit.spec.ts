import { test } from '../../../src/fixtures';
import { OTHER_REASON } from '../../../src/data/report.data';

const CASE = '[TC-RPT-010] "Lainnya" with an empty reason cannot be submitted';

test(CASE, { tag: ['@p2'] }, async ({ report, articlePath }) => {
  await report.open(articlePath);
  await report.selectReason(OTHER_REASON);
  await report.verifyOtherReasonFieldShown();
  await report.verifySubmitDisabled();
});

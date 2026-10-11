import { test } from '../../../src/fixtures';
import { OTHER_REASON } from '../../../src/data/report.data';

const CASE = '[TC-RPT-006] "Lainnya" reveals a free-text field for the reason';

test(CASE, { tag: ['@p3'] }, async ({ report, articlePath }) => {
  await report.open(articlePath);
  await report.verifyOtherReasonFieldHidden();

  await report.selectReason(OTHER_REASON);
  await report.verifyOtherReasonFieldShown();
});

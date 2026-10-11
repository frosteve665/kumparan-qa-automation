import { test } from '../../../src/fixtures';
const CASE = '[TC-RPT-005] Only one reason can be selected at a time';

test(CASE, { tag: ['@p2'] }, async ({ report, articlePath }) => {
  await report.open(articlePath);
  await report.selectReason(0);
  await report.selectReason(3);
  await report.verifyOnlySelected(3, 0);
});

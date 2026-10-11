import { test } from '../../../src/fixtures';
const CASE = '[TC-RPT-007] Guest can complete the report form up to submit';

// Observation: whether submitting then asks a guest to log in cannot be checked without submitting.
test(CASE, { tag: ['@p1'] }, async ({ report, articlePath, header }) => {
  await report.open(articlePath);
  await header.verifyShown();

  await report.selectReason(0);
  await report.verifySubmitEnabled();
});

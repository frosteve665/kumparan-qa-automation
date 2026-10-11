import { test } from '../../../src/fixtures';
const CASE = '[TC-RPT-003] Submit stays disabled until a reason is chosen';

test(CASE, { tag: ['@p1'] }, async ({ report, articlePath }) => {
  await report.open(articlePath);
  await report.verifySubmitDisabled();
});

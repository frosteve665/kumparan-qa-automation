import { test } from '../../../src/fixtures';
import { REPORT } from '../../../src/data/report.data';

const CASE = '[TC-RPT-008] Report link for a missing story is handled cleanly';

test(CASE, { tag: ['@p3'] }, async ({ report }) => {
  const status = await report.openForSlug(REPORT.missingStorySlug);
  await report.verifyNoStoryShown(status);
});

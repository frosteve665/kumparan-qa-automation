import { test } from '../../../src/fixtures';
import { openReportLinkInNewTab } from '../../../src/flows/report.flow';

const CASE = '[TC-RPT-009] "Batal" on a report link opened in a new tab takes the reader out of the form';

test(
  CASE,
  {
    tag: ['@p2', '@defect'],
    annotation: {
      type: 'issue',
      description: 'BUG-001: "Batal" only calls history.back(): dead button on a shared link in a new tab',
    },
  },
  async ({ page, platform, articlePath }) => {
    test.fail(true, 'Known defect BUG-001 still reproduces');
    const report = await openReportLinkInNewTab(page, platform, articlePath);

    await report.cancel();
    await report.verifyFormClosed();
  },
);

import { test } from '../../../src/fixtures';

const CASE = '[TC-RPT-012] Keyboard user opening the report form keeps the form URL in the address bar';

// Desktop only: mobile has no keyboard path. The bug shows on about 9 of 10 keyboard openings
// (0/12 with normal scrolling), so the check repeats the path: the URL must stay every time.
const ATTEMPTS = 3;

test(
  CASE,
  {
    tag: ['@p3', '@defect', '@desktop-only'],
    annotation: {
      type: 'issue',
      description: 'BUG-002: address bar switches back to the story while the report form is shown (keyboard path)',
    },
  },
  async ({ article, articlePath, report }) => {
    test.fail(true, 'Known defect BUG-002 still reproduces');
    test.setTimeout(120_000);

    for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
      await article.open(articlePath);
      await article.openReportWithKeyboard();
      await report.verifyFormShown();
      await report.verifyUrlStaysOnForm();
    }
  },
);

import { test, expect } from '../../../src/fixtures';
const CASE = '[TC-NAV-005] Homepage loads without first-party JavaScript errors';

test(
  CASE,
  {
    tag: ['@p2'],
    annotation: {
      type: 'issue',
      description: 'BUG-003: React hydration mismatch (error #418) on the desktop homepage',
    },
  },
  async ({ home, platform }) => {
    test.fail(platform === 'desktop', 'Known defect BUG-003 still reproduces on desktop');

    // Ads and analytics are blocked; only errors thrown by kumparan's own page count.
    const errors = await home.openCollectingErrors();
    expect(errors, 'uncaught errors on the homepage').toEqual([]);
  },
);

import { test, expect } from '../src/fixtures';

/**
 * Seed for Playwright's planner/generator/healer agents.
 *
 * The agents' browser session starts from this test, so it inherits every
 * project fixture: ad blocking, the promo auto-dismiss, the evidence caption
 * and, most importantly, the write guard. An AI agent exploring production can
 * therefore never publish a comment or a report, even by accident.
 *
 * Project: desktop-chrome (kumparan.com). Run the agents with --project=mobile-chrome
 * to explore m.kumparan.com through the same seed.
 */
test.describe('Seed', () => {
  test('seed', async ({ home }) => {
    await home.open();
    await expect(home.header.logo).toBeVisible();
  });
});

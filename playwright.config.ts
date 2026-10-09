import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import type { TestOptions } from './src/fixtures';

const isCI = !!process.env.CI;

/** Browser specs: hand-written (tests/web), agent-generated (tests/agent) and the agents' seed. */
const WEB_SPECS = [/tests[\/](web|agent)[\/].*\.spec\.ts$/, /tests[\/]seed\.spec\.ts$/];

/**
 * Projects
 *  desktop-chrome  kumparan.com on desktop Chrome
 *  mobile-chrome   m.kumparan.com on Pixel 7 emulation
 *  mobile-safari   m.kumparan.com on iPhone 15 (WebKit), cross-engine check
 *  api-graphql     GraphQLZero, no browser
 *
 * The web specs are written once and run in every web project; page objects
 * hide the desktop/mobile layout differences.
 */
export default defineConfig<TestOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // Live production site: retries absorb network noise only. A retried pass is
  // reported as "flaky" by Playwright, never hidden as a clean pass.
  retries: isCI ? 2 : 1,
  // Polite to a production site and below Cloudflare's rate limits.
  workers: isCI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./src/reporters/evidence-reporter.ts', { outputDir: 'reports' }],
    ...(isCI ? [['github'] as ['github']] : []),
  ],
  use: {
    testIdAttribute: 'data-qa-id',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    // Evidence policy: every test is recorded (with the on-page caption naming
    // the test case and step); a final screenshot is always kept; traces are
    // kept for failures only, because they are large.
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  },
  projects: [
    {
      name: 'desktop-chrome',
      testMatch: WEB_SPECS,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        video: { mode: 'on', size: { width: 1280, height: 800 } },
        baseURL: env.desktopBaseUrl,
        platform: 'desktop',
      },
    },
    {
      name: 'mobile-chrome',
      testMatch: WEB_SPECS,
      use: { ...devices['Pixel 7'], baseURL: env.mobileBaseUrl, platform: 'mobile' },
    },
    {
      name: 'mobile-safari',
      testMatch: /tests[\/]web[\/].*\.spec\.ts$/,
      grep: /@smoke/,
      use: { ...devices['iPhone 15'], baseURL: env.mobileBaseUrl, platform: 'mobile' },
    },
    {
      name: 'api-graphql',
      testMatch: /tests[\/]api[\/].*\.spec\.ts$/,
      use: { baseURL: env.graphqlUrl },
    },
  ],
});

import { expect, type Page } from '@playwright/test';
import type { Platform } from '../config/platform';
import { ReportPage } from '../pages/report.page';

/**
 * A reader opens a shared report link in a new tab. Unlike a fresh Playwright page (whose first
 * history entry is about:blank), a tab opened this way has no history of its own.
 */
export async function openReportLinkInNewTab(page: Page, platform: Platform, articlePath: string): Promise<ReportPage> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const newTab = page.context().waitForEvent('page');
  await page.evaluate((url) => window.open(url, '_blank'), `/report/story/${articlePath.split('/').pop()}`);
  const tab = await newTab;

  const report = new ReportPage(tab, platform);
  await report.reason(0).waitFor();
  expect(await tab.evaluate(() => history.length), 'new tab has no history').toBe(1);
  return report;
}

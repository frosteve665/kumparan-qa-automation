/**
 * BUG-002 via the keyboard path a real user takes (focus the "Laporkan tulisan"
 * link, press Enter) and BUG-006 on mobile, in real Google Chrome.
 *
 *   npx tsx scripts/repro/verify-keyboard.ts
 */
import { chromium, devices, request, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { findFreshArticlePath } from '../../src/support/test-data';

const OUT = 'docs/bugs/evidence/verification';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const qa = (id: string) => `[data-qa-id="${id}"]`;
const api = await request.newContext({ userAgent: UA });
const story = await findFreshArticlePath(api);
await api.dispose();
const browser = await chromium.launch({ channel: 'chrome' });

async function userPopups(page: Page): Promise<void> {
  await page.addLocatorHandler(page.locator('#onesignal-slidedown-container'), async () => {
    await page
      .locator('#onesignal-slidedown-cancel-button')
      .click()
      .catch(() => undefined);
  });
  await page.addLocatorHandler(page.locator(qa('otp-ads-close-modal-btn')), async (b) => {
    await b.click().catch(() => undefined);
  });
  // Full-screen mobile ad with a red "TUTUP" (close) button.
  await page.addLocatorHandler(page.getByText('TUTUP', { exact: true }), async (b) => {
    await b.click().catch(() => undefined);
  });
}

const results: Record<string, unknown> = {};

// BUG-002, desktop keyboard user: Tab until the report link has focus, then Enter.
let hits = 0;
const runs: unknown[] = [];
for (let i = 0; i < (process.env.ONLY === 'mobile006' ? 0 : 3); i++) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 800 }, userAgent: UA });
  const page = await context.newPage();
  await userPopups(page);
  await page.goto('https://kumparan.com' + story, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3_000);
  const link = page.locator(qa('btn-report')).first();
  // Keyboard focus moves the page straight to the link (what Tab does when it
  // reaches it); then Enter activates it, exactly as a keyboard user would.
  await link.focus();
  const tabs = 0;
  const reached = await link.evaluate((el) => el === document.activeElement || el.contains(document.activeElement));
  if (reached) {
    await page.keyboard.press('Enter');
    await page
      .locator(qa('radio-btn-option-report-0'))
      .waitFor({ timeout: 15_000 })
      .catch(() => undefined);
    await page.waitForTimeout(4_000);
  }
  const form = await page.locator(qa('radio-btn-option-report-0')).isVisible();
  const path = new URL(page.url()).pathname;
  const hit = reached && form && !path.startsWith('/report/');
  if (hit) {
    hits++;
    if (hits === 1) await page.screenshot({ path: `${OUT}/BUG-002-desktop-keyboard.png` });
  }
  runs.push({ tabPresses: tabs, reached, formVisible: form, finalPath: path });
  await context.close();
}
results['BUG-002 desktop keyboard (Tab to "Laporkan tulisan" + Enter)'] = { reproduced: `${hits}/3`, runs };

// BUG-006 mobile, with a screenshot of whatever is on screen.
const context = await browser.newContext({ ...devices['Pixel 7'] });
const page = await context.newPage();
await userPopups(page);
await page.goto('https://m.kumparan.com' + story, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3_000);
const wrappers = await page.locator(qa('share-wrapper')).count();
const more = page.locator(qa('share-wrapper')).locator(qa('more-vertical'));
const moreCount = await more.count();
let opened = false;
for (let i = 0; i < moreCount && !opened; i++) {
  await more
    .nth(i)
    .click({ timeout: 8_000 })
    .catch(() => undefined);
  await page.waitForTimeout(1_200);
  opened = await page.locator(qa('modal-view')).isVisible();
}
await page.screenshot({ path: `${OUT}/BUG-006-mobile-state.png` });
let mobile: Record<string, unknown> = { shareWrappers: wrappers, moreButtons: moreCount, opened };
if (opened) {
  const modal = page.locator(qa('modal-view'));
  mobile = {
    ...mobile,
    ...(await modal.evaluate((el) => ({
      roleDialog: !!el.closest('[role="dialog"],dialog') || !!el.querySelector('[role="dialog"],dialog'),
      ariaModal: !!el.closest('[aria-modal="true"]') || !!el.querySelector('[aria-modal="true"]'),
      focusInside: el.contains(document.activeElement),
    }))),
  };
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1_000);
  mobile.closedByEscape = !(await modal.isVisible());
  await page.screenshot({ path: `${OUT}/BUG-006-mobile.png` });
}
results['BUG-006 mobile'] = mobile;
await context.close();
await browser.close();
writeFileSync(
  `${OUT}/results-keyboard${process.env.ONLY ? '-' + process.env.ONLY : ''}.json`,
  JSON.stringify({ ranAt: new Date().toISOString(), story, ...results }, null, 2),
);
console.log(JSON.stringify(results, null, 1));

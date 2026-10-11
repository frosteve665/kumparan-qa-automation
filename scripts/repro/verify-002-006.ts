/**
 * Focused re-verification of BUG-002 (URL rewrite while the report form is
 * shown) and BUG-006 (share modal ignores Escape) in real Google Chrome with
 * user-like interactions only: mouse wheel, End key, real clicks, real keyboard.
 *
 *   npx tsx scripts/repro/verify-002-006.ts
 */
import { chromium, devices, request, type BrowserContextOptions, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { findFreshArticlePath } from '../../src/support/test-data';

const OUT = 'docs/bugs/evidence/verification';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const PLATFORMS: [string, BrowserContextOptions, string][] = [
  ['desktop', { viewport: { width: 1366, height: 800 }, userAgent: UA }, 'https://kumparan.com'],
  ['mobile', { ...devices['Pixel 7'] }, 'https://m.kumparan.com'],
];
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
  const cta = page.getByRole('button', { name: 'Jelajahi Sekarang' });
  await page.addLocatorHandler(cta, async () => {
    await page
      .locator('div')
      .filter({ has: cta })
      .filter({ has: page.locator(qa('close')) })
      .last()
      .getByRole('button')
      .filter({ has: page.locator(qa('close')) })
      .click()
      .catch(() => undefined);
  });
}

type Scroll = 'wheel-then-click-immediately' | 'end-key-then-click' | 'click-without-scrolling';
const results: Record<string, unknown> = { story };

const bug002: Record<string, string> = {};
for (const [platform, opts, base] of PLATFORMS) {
  for (const how of ['wheel-then-click-immediately', 'end-key-then-click', 'click-without-scrolling'] as Scroll[]) {
    let hit = 0;
    const tries = 3;
    for (let i = 0; i < tries; i++) {
      const context = await browser.newContext(opts);
      const page = await context.newPage();
      await userPopups(page);
      await page.goto(base + story, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2_500);
      if (how === 'wheel-then-click-immediately')
        for (let y = 0; y < 14; y++) {
          await page.mouse.wheel(0, 600);
          await page.waitForTimeout(120);
        }
      if (how === 'end-key-then-click') {
        await page
          .locator('body')
          .click({ position: { x: 5, y: 300 } })
          .catch(() => undefined);
        await page.keyboard.press('End');
        await page.waitForTimeout(300);
      }
      // "click-without-scrolling": the click itself scrolls the button into view (what a test or assistive tech does).
      const ok = await page
        .locator(qa('btn-report'))
        .first()
        .click({ timeout: 15_000 })
        .then(
          () => true,
          () => false,
        );
      if (ok) {
        await page
          .locator(qa('radio-btn-option-report-0'))
          .waitFor({ timeout: 15_000 })
          .catch(() => undefined);
        await page.waitForTimeout(4_000);
        const form = await page.locator(qa('radio-btn-option-report-0')).isVisible();
        if (form && !new URL(page.url()).pathname.startsWith('/report/')) {
          hit++;
          await page.screenshot({ path: `${OUT}/BUG-002-${platform}-${how}.png` });
        }
      }
      await context.close();
    }
    bug002[`${platform} / ${how}`] = `${hit}/${tries}`;
  }
}
results['BUG-002'] = bug002;

const bug006: unknown[] = [];
for (const [platform, opts, base] of PLATFORMS) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  await userPopups(page);
  await page.goto(base + story, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3_000);
  const more = page.locator(qa('share-wrapper')).first().locator(qa('more-vertical'));
  const modal = page.locator(qa('modal-view'));
  // Retry like a user tapping again if nothing happened.
  for (let i = 0; i < 4 && !(await modal.isVisible()); i++) {
    await more.click({ timeout: 10_000 }).catch(() => undefined);
    await page.waitForTimeout(1_200);
  }
  if (!(await modal.isVisible())) {
    bug006.push({ platform, error: 'share modal did not open' });
    await context.close();
    continue;
  }
  const semantics = await modal.evaluate((el) => ({
    roleDialog: !!el.closest('[role="dialog"],dialog') || !!el.querySelector('[role="dialog"],dialog'),
    ariaModal: !!el.closest('[aria-modal="true"]') || !!el.querySelector('[aria-modal="true"]'),
    focusInside: el.contains(document.activeElement),
  }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1_000);
  const closedByEscape = !(await modal.isVisible());
  let tabsToClose = -1;
  if (!closedByEscape) {
    for (let i = 1; i <= 60; i++) {
      await page.keyboard.press('Tab');
      if (
        await page
          .locator(qa('btn-close-modal'))
          .evaluate((el) => el === document.activeElement || el.contains(document.activeElement))
          .catch(() => false)
      ) {
        tabsToClose = i;
        break;
      }
    }
    await page.screenshot({ path: `${OUT}/BUG-006-${platform}.png` });
  }
  bug006.push({ platform, ...semantics, closedByEscape, tabPressesToReachClose: tabsToClose });
  await context.close();
}
results['BUG-006'] = bug006;

await browser.close();
writeFileSync(
  `${OUT}/results-002-006.json`,
  JSON.stringify(
    { ranAt: new Date().toISOString(), browser: 'Google Chrome, no ad blocking, no project fixtures', ...results },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 1));

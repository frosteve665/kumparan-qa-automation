/**
 * BUG-002 reproduction: measures how often the address bar switches back to the
 * story (/full) while the report form is on screen. Writes a URL timeline per
 * attempt to docs/bugs/evidence/BUG-002-timeline.json and a screenshot of the
 * reproduced state with the current URL stamped on it.
 *
 *   npx tsx scripts/repro/bug-002.ts [attempts=5]
 */
import { chromium, devices, request, selectors } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { blockAds } from '../../src/support/network';
import { findFreshArticlePath } from '../../src/support/test-data';
import { autoDismissPromos } from '../../src/support/interruptions';

const attempts = Number(process.argv[2] ?? 5);
selectors.setTestIdAttribute('data-qa-id');

const api = await request.newContext();
const story = await findFreshArticlePath(api);
await api.dispose();

const browser = await chromium.launch();
const out: Record<string, { reproduced: number; attempts: { timeline: string[]; finalUrl: string; formVisible: boolean }[] }> = {};

for (const [platform, device, base] of [['desktop', devices['Desktop Chrome'], 'https://kumparan.com'], ['mobile', devices['Pixel 7'], 'https://m.kumparan.com']] as const) {
  out[platform] = { reproduced: 0, attempts: [] };
  for (let i = 0; i < attempts; i++) {
    const context = await browser.newContext({ ...device });
    await blockAds(context);
    const page = await context.newPage();
    await autoDismissPromos(page);
    const timeline: string[] = [];
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) timeline.push(f.url().replace(base, '')); });
    await page.goto(base + story, { waitUntil: 'domcontentloaded' });
    // Scroll from inside the page: the article re-renders while scrolling, which
    // would detach a held element handle.
    await page.getByTestId('end_of_article').waitFor({ state: 'attached' });
    await page.evaluate(() => document.querySelector('[data-qa-id="end_of_article"]')?.scrollIntoView());
    await page.waitForTimeout(1_500);
    const opened = await page.getByTestId('btn-report').first().click({ timeout: 15_000 }).then(() => true, () => false);
    if (!opened) {
      out[platform].attempts.push({ timeline: [...timeline, '(report button not clickable: attempt void)'], finalUrl: page.url(), formVisible: false });
      await context.close();
      continue;
    }
    await page.getByTestId('radio-btn-option-report-0').waitFor({ timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(4_000);
    const finalUrl = page.url().replace(base, '');
    const formVisible = await page.getByTestId('radio-btn-option-report-0').isVisible();
    const reproduced = formVisible && !finalUrl.startsWith('/report/');
    if (reproduced) {
      out[platform].reproduced++;
      if (out[platform].reproduced === 1) {
        // Stamp the address-bar URL onto the page so the screenshot proves the mismatch.
        await page.evaluate((url) => {
          const bar = document.createElement('div');
          bar.textContent = `Address bar: ${url}`;
          bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:8px 12px;background:#b42318;color:#fff;font:600 13px system-ui';
          document.body.appendChild(bar);
        }, page.url());
        await page.screenshot({ path: `docs/bugs/evidence/BUG-002-${platform}.png` });
      }
    }
    out[platform].attempts.push({ timeline, finalUrl, formVisible });
    await context.close();
  }
  console.log(`${platform}: reproduced ${out[platform].reproduced}/${attempts}`);
}
await browser.close();
writeFileSync('docs/bugs/evidence/BUG-002-timeline.json', JSON.stringify({ story, ranAt: new Date().toISOString(), ...out }, null, 2));

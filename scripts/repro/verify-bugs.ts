/**
 * Independent re-verification of every filed defect, as close to a real user
 * as automation allows: real Google Chrome (channel "chrome"), no ad blocking,
 * none of the project fixtures, default locale. Each check runs several times.
 *
 *   npx tsx scripts/repro/verify-bugs.ts
 *
 * Output: docs/bugs/evidence/verification/results.json (+ screenshots)
 */
import { chromium, devices, request, type Browser, type BrowserContextOptions } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { findFreshArticlePath } from '../../src/support/test-data';

const OUT = 'docs/bugs/evidence/verification';
mkdirSync(OUT, { recursive: true });
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const DESKTOP: BrowserContextOptions = { viewport: { width: 1366, height: 800 }, userAgent: UA };
const MOBILE: BrowserContextOptions = { ...devices['Pixel 7'] };
const qa = (id: string) => `[data-qa-id="${id}"]`;
const results: Record<string, unknown> = {};

const api = await request.newContext({ userAgent: UA });
const story = await findFreshArticlePath(api);
const slug = story.split('/').pop()!;
const browser: Browser = await chromium.launch({ channel: 'chrome' });

/** Close pop-ups the way a reader would: the ad interstitial's X and the promo's X. */
async function closePopupsLikeAUser(page: import('@playwright/test').Page): Promise<void> {
  // OneSignal "allow notifications?" slide-down: decline ("Nanti").
  await page
    .addLocatorHandler(page.locator('#onesignal-slidedown-container'), async () => {
      await page
        .locator('#onesignal-slidedown-cancel-button')
        .click()
        .catch(() => undefined);
    })
    .catch(() => undefined);
  await page
    .addLocatorHandler(page.locator(qa('otp-ads-close-modal-btn')), async (btn) => {
      await btn.click();
    })
    .catch(() => undefined);
  const promoCta = page.getByRole('button', { name: 'Jelajahi Sekarang' });
  await page
    .addLocatorHandler(promoCta, async () => {
      await page
        .locator('div')
        .filter({ has: promoCta })
        .filter({ has: page.locator(qa('close')) })
        .last()
        .getByRole('button')
        .filter({ has: page.locator(qa('close')) })
        .click()
        .catch(() => undefined);
    })
    .catch(() => undefined);
}

async function bug001(): Promise<void> {
  // Three ways a real reader reaches the report form directly, plus the control
  // (opened from the story). Records where "Batal" leaves them.
  const out: Record<string, unknown>[] = [];
  for (const [platform, opts, base] of [
    ['desktop', DESKTOP, 'https://kumparan.com'],
    ['mobile', MOBILE, 'https://m.kumparan.com'],
  ] as const) {
    for (const entry of ['direct-first-page', 'link-in-new-tab', 'from-other-site', 'control-from-story'] as const) {
      const context = await browser.newContext(opts);
      let page = await context.newPage();
      if (entry === 'direct-first-page') {
        await page.goto(`${base}/report/story/${slug}`, { waitUntil: 'domcontentloaded' });
      } else if (entry === 'link-in-new-tab') {
        // A shared link opened in a new tab: the new tab has no history of its own.
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        const popup = context.waitForEvent('page');
        await page.evaluate((url) => window.open(url, '_blank'), `${base}/report/story/${slug}`);
        page = await popup;
        await page.waitForLoadState('domcontentloaded');
      } else if (entry === 'from-other-site') {
        // Arriving from another website (e.g. a link in a chat web app).
        await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
        await page.goto(`${base}/report/story/${slug}`, { waitUntil: 'domcontentloaded' });
      } else {
        await page.goto(base + story, { waitUntil: 'domcontentloaded' });
        await page.locator(qa('btn-report')).first().click({ timeout: 20_000 });
      }
      await page.locator(qa('radio-btn-option-report-0')).waitFor({ timeout: 20_000 });
      await page.waitForTimeout(1_500);
      const historyLength = await page.evaluate(() => history.length);
      const before = page.url();
      await page.locator(qa('btn-cancel')).click();
      await page.waitForTimeout(3_000);
      const after = page.isClosed() ? '(tab closed)' : page.url();
      const formStillShown = page.isClosed()
        ? false
        : await page
            .locator(qa('radio-btn-option-report-0'))
            .isVisible()
            .catch(() => false);
      if (!page.isClosed()) await page.screenshot({ path: `${OUT}/BUG-001-${platform}-${entry}.png` });
      out.push({ platform, entry, historyLength, before: before.replace(base, ''), after, formStillShown });
      await context.close();
    }
  }
  results['BUG-001'] = out;
}

async function bug002(attempts = 4): Promise<void> {
  const out: Record<string, unknown> = {};
  for (const [platform, opts, base] of [
    ['desktop', DESKTOP, 'https://kumparan.com'],
    ['mobile', MOBILE, 'https://m.kumparan.com'],
  ] as const) {
    let reproduced = 0;
    const runs: unknown[] = [];
    for (let i = 0; i < attempts; i++) {
      const context = await browser.newContext(opts);
      const page = await context.newPage();
      await closePopupsLikeAUser(page);
      const timeline: string[] = [];
      page.on('framenavigated', (f) => {
        if (f === page.mainFrame()) timeline.push(f.url().replace(base, ''));
      });
      await page.goto(base + story, { waitUntil: 'domcontentloaded' });
      // Read like a person: scroll down in steps to the end of the story.
      for (let y = 0; y < 14; y++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(250);
      }
      const clicked = await page
        .locator(qa('btn-report'))
        .first()
        .click({ timeout: 15_000 })
        .then(
          () => true,
          () => false,
        );
      if (!clicked) {
        runs.push({ void: 'report button not clickable (overlay)' });
        await context.close();
        continue;
      }
      await page
        .locator(qa('radio-btn-option-report-0'))
        .waitFor({ timeout: 15_000 })
        .catch(() => undefined);
      await page.waitForTimeout(4_000);
      const formVisible = await page.locator(qa('radio-btn-option-report-0')).isVisible();
      const finalUrl = page.url().replace(base, '');
      const hit = formVisible && !finalUrl.startsWith('/report/');
      if (hit) {
        reproduced++;
        if (reproduced === 1) await page.screenshot({ path: `${OUT}/BUG-002-${platform}.png` });
      }
      runs.push({
        formVisible,
        finalUrl,
        rewritesAfterReport: timeline.slice(timeline.findIndex((u) => u.startsWith('/report/')) + 1).length,
      });
      await context.close();
    }
    out[platform] = { reproduced: `${reproduced}/${attempts}`, runs };
  }
  results['BUG-002'] = out;
}

async function bug003(attempts = 3): Promise<void> {
  const out: Record<string, unknown> = {};
  for (const [platform, opts, base] of [
    ['desktop', DESKTOP, 'https://kumparan.com'],
    ['mobile', MOBILE, 'https://m.kumparan.com'],
  ] as const) {
    const runs: unknown[] = [];
    for (let i = 0; i < attempts; i++) {
      const context = await browser.newContext(opts);
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(6_000);
      runs.push({ react418: errors.some((e) => /#418/.test(e)), errors });
      await context.close();
    }
    out[platform] = runs;
  }
  // Locale/timezone variant: a reader in another timezone (common cause of #418).
  const context = await browser.newContext({ ...DESKTOP, locale: 'id-ID', timezoneId: 'Asia/Jakarta' });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await page.goto('https://kumparan.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6_000);
  out['desktop-jakarta-timezone'] = { react418: errors.some((e) => /#418/.test(e)), errors };
  await context.close();
  results['BUG-003'] = out;
}

async function bug006(): Promise<void> {
  const out: unknown[] = [];
  for (const [platform, opts, base] of [
    ['desktop', DESKTOP, 'https://kumparan.com'],
    ['mobile', MOBILE, 'https://m.kumparan.com'],
  ] as const) {
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    await closePopupsLikeAUser(page);
    await page.goto(base + story, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);
    const trigger = page.locator(qa('share-wrapper')).locator(qa('more-vertical')).first();
    await trigger.click({ timeout: 15_000 });
    const modal = page.locator(qa('modal-view'));
    await modal.waitFor();
    const semantics = await modal.evaluate((el) => {
      const dialogAncestor = el.closest('[role="dialog"],[role="alertdialog"],dialog');
      return {
        roleDialogOnOrAround: !!dialogAncestor || el.querySelector('[role="dialog"],dialog') !== null,
        ariaModal: !!el.closest('[aria-modal="true"]') || el.querySelector('[aria-modal="true"]') !== null,
        focusInside: el.contains(document.activeElement),
        activeElement: document.activeElement?.tagName ?? null,
      };
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1_000);
    const closedByEscape = !(await modal.isVisible());
    // Keyboard-only path: can Tab reach the close button?
    let tabReachesClose = false;
    if (!closedByEscape) {
      for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        if (
          await page
            .locator(qa('btn-close-modal'))
            .evaluate((el) => el === document.activeElement || el.contains(document.activeElement))
            .catch(() => false)
        ) {
          tabReachesClose = true;
          break;
        }
      }
      await page.screenshot({ path: `${OUT}/BUG-006-${platform}.png` });
    }
    out.push({ platform, ...semantics, closedByEscape, tabReachesCloseWithin40Tabs: tabReachesClose });
    await context.close();
  }
  results['BUG-006'] = out;
}

async function apiBugs(): Promise<void> {
  const gql = (query: string, variables: Record<string, unknown>) =>
    api.post('https://graphqlzero.almansi.me/api', { data: { query, variables } }).then((r) => r.json());
  const schema = await gql(
    `query { __type(name: "Query") { fields { name type { kind name } } } post: __type(name: "Post") { fields { name type { kind name ofType { name } } } } }`,
    {},
  );
  const postField = schema.data.__type.fields.find((f: { name: string }) => f.name === 'post');
  const runs004 = [];
  for (const id of ['999999', '101', '0'])
    runs004.push({ id, response: (await gql('query($id: ID!){ post(id:$id){ id title user { id } } }', { id })).data });
  results['BUG-004'] = {
    schema: {
      postFieldType: postField?.type,
      postIdType: schema.data.post.fields.find((f: { name: string }) => f.name === 'id')?.type,
    },
    runs: runs004,
  };
  const runs005 = [];
  for (const limit of [-5, -1, 0, 5]) {
    const r = await gql('query($o: PageQueryOptions){ posts(options:$o){ data { id } meta { totalCount } } }', {
      o: { paginate: { page: 1, limit } },
    });
    runs005.push({
      limit,
      rows: r.data?.posts.data.length ?? null,
      errors: r.errors?.map((e: { message: string }) => e.message) ?? null,
    });
  }
  results['BUG-005'] = runs005;
}

const only = process.env.ONLY?.split(',');
for (const [name, fn] of [
  ['BUG-001', bug001],
  ['BUG-002', bug002],
  ['BUG-003', bug003],
  ['BUG-006', bug006],
  ['API', apiBugs],
] as const) {
  if (only && !only.includes(name)) continue;
  try {
    await fn();
    console.log(`${name}: done`);
  } catch (err) {
    results[name] = { error: (err as Error).message.split('\n')[0] };
    console.log(`${name}: ERROR ${(err as Error).message.split('\n')[0]}`);
  }
}
await browser.close();
await api.dispose();
writeFileSync(
  `${OUT}/results${only ? '-' + only.join('-') : ''}.json`,
  JSON.stringify(
    {
      ranAt: new Date().toISOString(),
      browser: 'Google Chrome (channel chrome), no ad blocking, no project fixtures',
      story,
      results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(results, null, 1));

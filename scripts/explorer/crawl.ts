/**
 * Site Explorer, layer 1: a deterministic flow crawler (no AI model, no tokens).
 *
 * For each page type on each platform, it clicks every interactive element that
 * carries a data-qa-id in a fresh browser context and records where it lands,
 * whether login is required, what appeared, and which GraphQL operations fired.
 * The result, knowledge/flow-map.json, is the shared knowledge base for test
 * design, page objects, the Playwright agents, and UI-drift detection.
 *
 *   npm run explore                 # guest view, desktop + mobile
 *   npm run explore -- --only=article --platform=mobile
 *
 * Production safety: submit buttons, logout and social login are never clicked,
 * external links are recorded but not followed, the write guard and ad blocker
 * are active, and concurrency is capped.
 */
import { chromium, devices, request, selectors, type Browser, type BrowserContextOptions, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../../src/config/env';
import type { Platform } from '../../src/config/platform';
import { blockAds, guardWrites, type BlockedWrite } from '../../src/support/network';
import { findFreshArticlePath } from '../../src/support/test-data';

const OUT_DIR = 'knowledge';
const SHOTS = join(OUT_DIR, 'shots');
const CONCURRENCY = 3;
const SETTLE_MS = 1_800;

/** Never clicked: they publish, authenticate, or end the session. */
const DENY = /^(btn-send-comment|btn-save|btn-login-(fb|google|phone)|btn-logout|logout|submit|create-story)$/;
/** Not product behavior: ads, decorative icons, and layout containers. */
const NOISE = /ads|banner|billboard|skyscrap|native|promoted-link|otp-ads|out-of-page|over-the-page|background-image|progressive-render|app-version|-section$|-container$|^(main|header-top|homepage|desktop-page-container|main-content|article-main|story-page-\d+|story-paragraph|image|avatar|verified-\w+|card-footer-date|title|label-.*)$/;

type ActionType = 'navigation' | 'login-required' | 'modal' | 'state-change' | 'in-page' | 'external' | 'input' | 'no-effect' | 'error';

interface FlowAction {
  page: string;
  platform: Platform;
  view: 'guest' | 'signed-in';
  element: string;
  tag: string;
  label: string;
  type: ActionType;
  from: string;
  lands?: string;
  revealed: string[];
  disappeared: string[];
  messages: string[];
  network: string[];
  note?: string;
  screenshot?: string;
}

interface PageTarget {
  name: string;
  path: (articlePath: string) => string;
  /** Platforms this page applies to (default: both). */
  platforms?: Platform[];
  /** Brings the page into the state to explore (e.g. open the mobile side menu). */
  prepare?: (page: Page) => Promise<void>;
  /** Extra elements that must never be clicked on this page only. */
  deny?: RegExp;
}

const PAGES: PageTarget[] = [
  { name: 'home', path: () => '/' },
  { name: 'article', path: (a) => a },
  { name: 'comments', path: (a) => a.replace(/^\/([^/]+)\//, '/$1/response/') },
  // On the report form, btn-report is the SUBMIT button (on the article it only opens the form).
  { name: 'report', path: (a) => `/report/story/${a.split('/').pop()}`, deny: /^btn-report$/ },
  { name: 'search', path: () => '/search/banjir' },
  { name: 'login', path: () => '/login' },
  {
    name: 'side-menu',
    path: () => '/',
    platforms: ['mobile'],
    prepare: async (page) => {
      await page.getByTestId('burger-menu').click();
      await page.getByTestId('close-sidebar').waitFor({ state: 'visible', timeout: 5_000 });
      await page.waitForTimeout(500);
    },
  },
];

const args = new Map(process.argv.slice(2).map((a): [string, string] => { const [k = '', v = ''] = a.replace(/^--/, '').split('='); return [k, v]; }));
const signedIn = false; // guest view only: logged-in flows need a human (Cloudflare check)
const onlyPage = args.get('only');
const onlyPlatform = args.get('platform') as Platform | undefined;

function contextOptions(platform: Platform): BrowserContextOptions {
  const device = platform === 'mobile' ? devices['Pixel 7'] : { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };
  return {
    ...device,
    baseURL: platform === 'mobile' ? env.mobileBaseUrl : env.desktopBaseUrl,
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
  };
}

async function openFresh(browser: Browser, platform: Platform, path: string, prepare?: PageTarget['prepare']) {
  const context = await browser.newContext(contextOptions(platform));
  const blocked: BlockedWrite[] = [];
  await blockAds(context);
  await guardWrites(context, blocked);
  const page = await context.newPage();
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(SETTLE_MS);
  await page.getByTestId('otp-ads-close-modal-btn').click({ timeout: 1_000 }).catch(() => undefined);
  if (prepare) await prepare(page);
  return { context, page, blocked };
}

/**
 * Really on screen: rendered, not hidden, and horizontally inside the viewport.
 * The horizontal check matters on mobile, where the closed side menu is
 * rendered but parked off-screen.
 */
const ON_SCREEN = `(el) => {
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth && style.visibility !== 'hidden' && style.display !== 'none';
}`;

/** Visible data-qa-id values on the page right now. */
const visibleIds = (page: Page) =>
  page.evaluate(`[...new Set([...document.querySelectorAll('[data-qa-id]')].filter(${ON_SCREEN}).map((e) => e.getAttribute('data-qa-id')))]`) as Promise<string[]>;

/** Short user-facing texts that look like feedback (errors, toasts, empty states). */
const feedbackTexts = (page: Page) =>
  page.$$eval('[data-qa-id*="error" i],[data-qa-id*="toast" i],[data-qa-id*="message" i],[data-qa-id^="no-"],[role="alert"],[role="status"]', (els) =>
    els.map((e) => (e as HTMLElement).innerText?.trim()).filter((t): t is string => !!t && t.length < 160));

interface Candidate { id: string; tag: string; label: string; href: string | null; inputType: string | null }

async function discover(browser: Browser, platform: Platform, path: string, prepare?: PageTarget['prepare']): Promise<Candidate[]> {
  const { context, page } = await openFresh(browser, platform, path, prepare);
  await page.addScriptTag({ content: `window.__onScreen = ${ON_SCREEN};` });
  const candidates = await page.$$eval('[data-qa-id]', (els) => {
    const isOnScreen = (window as unknown as { __onScreen: (e: Element) => boolean }).__onScreen;
    const seen = new Set<string>();
    const owners = new Set<Element>();
    const out: { id: string; tag: string; label: string; href: string | null; inputType: string | null }[] = [];
    for (const el of els) {
      const id = el.getAttribute('data-qa-id')!;
      if (seen.has(id)) continue;
      const h = el as HTMLElement;
      if (!isOnScreen(el)) continue;
      const interactive = el.closest('a,button,input,label,[role="button"],[role="tab"],[role="radio"]') ?? (el.matches('[contenteditable],textarea,select') ? el : null);
      if (!interactive || owners.has(interactive)) continue;
      owners.add(interactive);
      seen.add(id);
      out.push({
        id,
        tag: interactive.tagName.toLowerCase(),
        label: (h.innerText || h.getAttribute('aria-label') || h.getAttribute('placeholder') || interactive.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        href: interactive.getAttribute('href'),
        inputType: interactive.tagName === 'INPUT' ? (interactive.getAttribute('type') ?? 'text') : null,
      });
    }
    return out;
  });
  await context.close();
  return candidates;
}

async function exercise(browser: Browser, platform: Platform, target: PageTarget, path: string, c: Candidate): Promise<FlowAction> {
  const base: FlowAction = {
    page: target.name, platform, view: signedIn ? 'signed-in' : 'guest', element: c.id, tag: c.tag, label: c.label,
    type: 'no-effect', from: path, revealed: [], disappeared: [], messages: [], network: [],
  };

  if (c.inputType && !/checkbox|radio|submit|button/.test(c.inputType)) return { ...base, type: 'input', note: `input[type=${c.inputType}]` };
  if (c.href && /^https?:/.test(c.href) && !/kumparan\.com/.test(c.href)) return { ...base, type: 'external', lands: c.href };

  const { context, page, blocked } = await openFresh(browser, platform, path, target.prepare);
  const network: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'POST' || !/graphql/.test(r.url())) return;
    const op = /"operationName"\s*:\s*"(\w+)"/.exec(r.postData() ?? '')?.[1];
    if (op) network.push(op);
  });
  try {
    // Scroll first: long articles rewrite the URL to /full while scrolling,
    // which must not be mistaken for the click's own navigation.
    const element = page.getByTestId(c.id).first();
    await element.scrollIntoViewIfNeeded({ timeout: 6_000 });
    await page.waitForTimeout(700);
    const before = new Set(await visibleIds(page));
    const urlBefore = page.url();
    network.length = 0;
    await element.click({ timeout: 6_000 });
    await page.waitForTimeout(SETTLE_MS);
    const urlAfter = page.url();
    const after = new Set(await visibleIds(page));
    const revealed = [...after].filter((id) => !before.has(id) && !NOISE.test(id));
    const disappeared = [...before].filter((id) => !after.has(id) && !NOISE.test(id));
    const shot = join(SHOTS, `${target.name}-${c.id}-${platform}${signedIn ? '-signed-in' : ''}.png`.replace(/[^\w.-]+/g, '_'));
    await page.screenshot({ path: shot });

    const landed = new URL(urlAfter);
    const action: FlowAction = { ...base, revealed, disappeared, messages: await feedbackTexts(page), network: [...new Set(network)], screenshot: shot.replace(/\\/g, '/') };
    if (blocked.length) return { ...action, type: 'error', note: `write guard blocked ${blocked.map((b) => b.operation).join(', ')}` };
    if (urlAfter !== urlBefore) {
      return { ...action, type: landed.pathname.startsWith('/login') ? 'login-required' : 'navigation', lands: normalizePath(landed) };
    }
    if (revealed.some((id) => /modal|popover|dialog|sidebar|menu|drop-down|close/.test(id))) return { ...action, type: 'modal' };
    if (network.length) return { ...action, type: 'state-change' };
    if (revealed.length || disappeared.length) return { ...action, type: 'in-page' };
    return action;
  } catch (err) {
    return { ...base, type: 'error', note: (err as Error).message.split('\n')[0] };
  } finally {
    await context.close();
  }
}

/** Collapse story-specific slugs so the map describes routes, not one article. */
function normalizePath(url: URL): string {
  const host = url.hostname.replace(/^(www\.)?/, '');
  const path = url.pathname.replace(/\/[a-z0-9-]+-[0-9A-Za-z]{11}(\/full)?$/, '/:story-slug$1');
  return (host.endsWith('kumparan.com') ? '' : host) + path + (url.search ? '?…' : '');
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  }));
  return results;
}

async function main(): Promise<void> {
  selectors.setTestIdAttribute('data-qa-id');
  mkdirSync(SHOTS, { recursive: true });
  const api = await request.newContext();
  const articlePath = await findFreshArticlePath(api);
  await api.dispose();

  const browser = await chromium.launch();
  const platforms: Platform[] = onlyPlatform ? [onlyPlatform] : ['desktop', 'mobile'];
  const targets = PAGES.filter((p) => !onlyPage || p.name === onlyPage);
  const actions: FlowAction[] = [];
  const inventory: Record<string, Record<Platform, string[]>> = {};

  for (const platform of platforms) {
    for (const target of targets.filter((t) => !t.platforms || t.platforms.includes(platform))) {
      const path = target.path(articlePath);
      const isDenied = (id: string) => DENY.test(id) || (target.deny?.test(id) ?? false);
      const found = await discover(browser, platform, path, target.prepare);
      const candidates = found.filter((c) => !isDenied(c.id) && !NOISE.test(c.id));
      const denied = found.filter((c) => isDenied(c.id));
      (inventory[target.name] ??= { desktop: [], mobile: [] })[platform] = candidates.map((c) => c.id);
      console.log(`[${platform}] ${target.name}: ${candidates.length} actions to exercise, ${denied.length} protected`);
      actions.push(...await pool(candidates, CONCURRENCY, (c) => exercise(browser, platform, target, path, c)));
      actions.push(...denied.map((c): FlowAction => ({
        page: target.name, platform, view: signedIn ? 'signed-in' : 'guest', element: c.id, tag: c.tag, label: c.label,
        type: 'no-effect', from: path, revealed: [], disappeared: [], messages: [], network: [], note: 'protected: never clicked by the explorer (publishes, authenticates or ends the session)',
      })));
    }
  }
  await browser.close();

  const file = join(OUT_DIR, signedIn ? 'flow-map.signed-in.json' : 'flow-map.json');
  const previous = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as { actions: FlowAction[] }) : undefined;
  writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), view: signedIn ? 'signed-in' : 'guest', sampleArticle: articlePath, inventory, actions }, null, 2));
  if (previous) writeDrift(previous.actions, actions);
  console.log(`\n${actions.length} actions mapped -> ${file}`);
}

/** UI-drift report: what changed since the last crawl, before any test fails. */
function writeDrift(before: FlowAction[], after: FlowAction[]): void {
  const key = (a: FlowAction) => `${a.platform}|${a.page}|${a.element}`;
  const prev = new Map(before.map((a) => [key(a), a]));
  const next = new Map(after.map((a) => [key(a), a]));
  const lines = ['# UI drift since previous crawl', ''];
  for (const [k, a] of next) {
    const p = prev.get(k);
    if (!p) lines.push(`- NEW  \`${k}\` (${a.type}${a.lands ? ` -> ${a.lands}` : ''})`);
    else if (p.type !== a.type || p.lands !== a.lands) lines.push(`- CHANGED \`${k}\`: ${p.type}${p.lands ? ` -> ${p.lands}` : ''}  =>  ${a.type}${a.lands ? ` -> ${a.lands}` : ''}`);
  }
  for (const k of prev.keys()) if (!next.has(k)) lines.push(`- REMOVED \`${k}\``);
  if (lines.length === 2) lines.push('No changes.');
  writeFileSync(join(OUT_DIR, 'drift.md'), lines.join('\n') + '\n');
}

main().catch((err) => { console.error(err); process.exit(1); });

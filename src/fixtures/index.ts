import { test as base, expect, request as playwrightRequest } from '@playwright/test';
import { existsSync } from 'node:fs';
import type { Platform } from '../config/platform';
import { AUTH_FILE } from '../config/paths';
import { env } from '../config/env';
import { blockAds, guardWrites, stubShareTargets, type BlockedWrite } from '../support/network';
import { findFreshArticlePath } from '../support/test-data';
import { autoDismissPromos } from '../support/interruptions';
import { installCaption } from '../support/caption';
import { ArticlePage } from '../pages/article.page';
import { CommentPage } from '../pages/comment.page';
import { HomePage } from '../pages/home.page';
import { Header } from '../pages/header.component';
import { LoginPage } from '../pages/login.page';
import { ReportPage } from '../pages/report.page';
import { SearchPage } from '../pages/search.page';

export interface TestOptions {
  /** Which kumparan front-end this project targets. Set per project in playwright.config.ts. */
  platform: Platform;
  /** Keep third-party ads on (used by the ads-on smoke test). */
  allowAds: boolean;
}

interface Fixtures {
  network: { blockedWrites: BlockedWrite[] };
  interruptions: void;
  home: HomePage;
  header: Header;
  login: LoginPage;
  article: ArticlePage;
  comments: CommentPage;
  report: ReportPage;
  search: SearchPage;
}

interface WorkerFixtures {
  /** A live, recently published article path, resolved once per worker so tests never depend on a stale hard-coded URL. */
  articlePath: string;
  /** Whether the target answers this network at all (its firewall blocks some datacenter ranges). */
  siteAccess: { blocked: boolean; detail: string };
}

interface AccessGate { accessGate: void }

export const test = base.extend<Fixtures & TestOptions & AccessGate, WorkerFixtures>({
  platform: ['desktop', { option: true }],
  allowAds: [false, { option: true }],

  network: [async ({ context, allowAds }, use) => {
    const blockedWrites: BlockedWrite[] = [];
    if (!allowAds) await blockAds(context);
    await guardWrites(context, blockedWrites);
    await stubShareTargets(context);
    await use({ blockedWrites });
    expect(blockedWrites, 'A comment/report submission was attempted and blocked by the write guard').toEqual([]);
  }, { auto: true }],

  interruptions: [async ({ page }, use, testInfo) => {
    await autoDismissPromos(page);
    await installCaption(page, testInfo);
    await use();
  }, { auto: true }],

  home: async ({ page, platform }, use) => use(new HomePage(page, platform)),
  header: async ({ page, platform }, use) => use(new Header(page, platform)),
  login: async ({ page, platform }, use) => use(new LoginPage(page, platform)),
  article: async ({ page, platform }, use) => use(new ArticlePage(page, platform)),
  comments: async ({ page, platform }, use) => use(new CommentPage(page, platform)),
  report: async ({ page, platform }, use) => use(new ReportPage(page, platform)),
  search: async ({ page, platform }, use) => use(new SearchPage(page, platform)),

  /**
   * Environment preflight. kumparan's firewall answers some networks (e.g.
   * GitHub-hosted runners) with "Sorry, you don't have permission to access
   * this website". That is an environment limitation, not a product or test
   * failure: every web test is skipped with that reason instead of failing.
   */
  siteAccess: [async ({ playwright }, use, workerInfo) => {
    const { baseURL, userAgent } = workerInfo.project.use;
    const api = await playwright.request.newContext(userAgent ? { userAgent } : {});
    let result = { blocked: false, detail: 'reachable' };
    try {
      const res = await api.get(baseURL ?? env.desktopBaseUrl, { timeout: 30_000 });
      const body = await res.text();
      if (res.status() === 403 || /don't have permission to access this website/i.test(body)) {
        result = { blocked: true, detail: `HTTP ${res.status()} from ${baseURL}: the site's firewall blocks this network` };
      }
    } catch (err) {
      result = { blocked: true, detail: `unreachable: ${(err as Error).message.split('\n')[0]}` };
    }
    await api.dispose();
    await use(result);
  }, { scope: 'worker' }],

  accessGate: [async ({ siteAccess }, use, testInfo) => {
    testInfo.skip(siteAccess.blocked, `environment: ${siteAccess.detail}. Run locally or on a self-hosted runner.`);
    await use();
  }, { auto: true }],

  articlePath: [async ({}, use) => {
    const api = await playwrightRequest.newContext();
    await use(await findFreshArticlePath(api));
    await api.dispose();
  }, { scope: 'worker' }],
});

export { expect };

/**
 * Signed-in tests reuse the session captured by `npm run auth:capture`
 * (login is behind a human-only Cloudflare challenge). Without it they are
 * skipped with a reason in the report, never silently passed.
 */
export const hasSession = existsSync(AUTH_FILE);
export function useSignedInSession(): void {
  test.skip(!hasSession, `No signed-in session at ${AUTH_FILE}. Run "npm run auth:capture" once (human ticks the Cloudflare box).`);
  test.use({ storageState: hasSession ? AUTH_FILE : undefined });
}

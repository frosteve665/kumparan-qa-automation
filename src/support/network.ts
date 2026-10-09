import type { BrowserContext, Request } from '@playwright/test';

/**
 * Third-party ad and tracking hosts. kumparan renders several ad slots per page
 * (skyscrapers, billboards, an "OTP" interstitial) that load late and shift
 * layout, which is the main source of flaky clicks. Blocking them makes runs
 * faster and deterministic; one smoke test runs with ads on so nothing is hidden.
 */
const AD_HOSTS = /doubleclick\.net|googlesyndication|googleadservices|adservice\.google|amazon-adsystem|criteo|pubmatic|jixie\.io|teads|taboola|outbrain|rubiconproject|openx\.net|adnxs|smartadserver|sharethrough|ib\.adnxs|imasdk\.googleapis/;

export async function blockAds(context: BrowserContext): Promise<void> {
  await context.route(AD_HOSTS, (route) => route.abort('blockedbyclient'));
}

/**
 * Share targets open in a popup. Tests assert the popup URL (what would be
 * shared) and answer it with an empty page, so no third-party site is loaded.
 */
const SHARE_TARGETS = /api\.whatsapp\.com|wa\.me|facebook\.com\/sharer|twitter\.com\/intent|x\.com\/intent|social-plugins\.line\.me|line\.me\/R/;

export async function stubShareTargets(context: BrowserContext): Promise<void> {
  await context.route(SHARE_TARGETS, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>share stub</title>' }));
}

/** GraphQL operations that would publish user content. They must never reach kumparan. */
const FORBIDDEN_WRITE = /(comment|response|report|flag)/i;

export interface BlockedWrite { url: string; operation: string }

/**
 * Write guard: a second safety net behind the rule "assert the comment/report
 * page, never submit". Tests never click submit; if a regression in a test or
 * page object ever does, the request is aborted here before it leaves the
 * browser, and the fixture fails the test.
 */
export async function guardWrites(context: BrowserContext, blocked: BlockedWrite[]): Promise<void> {
  await context.route(/kumparan\.com/, async (route) => {
    const request = route.request();
    if (isForbiddenWrite(request)) {
      blocked.push({ url: request.url(), operation: operationName(request) });
      return route.abort('blockedbyclient');
    }
    return route.fallback();
  });
}

function operationName(request: Request): string {
  const body = request.postData() ?? '';
  return /"operationName"\s*:\s*"(\w+)"/.exec(body)?.[1] ?? /mutation\s+(\w+)/.exec(body)?.[1] ?? '(unnamed)';
}

function isForbiddenWrite(request: Request): boolean {
  if (request.method() !== 'POST') return false;
  const body = request.postData() ?? '';
  return /\bmutation\b/.test(body) && FORBIDDEN_WRITE.test(operationName(request));
}

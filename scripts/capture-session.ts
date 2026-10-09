/**
 * One-time, human-assisted session capture.
 *
 * kumparan protects /login with Cloudflare Turnstile ("Verify you are human").
 * A captcha exists to stop bots, so the suite never tries to defeat it. Instead
 * a person ticks the box once, and the authenticated storageState is saved to
 * .auth/ and reused by every test that needs a signed-in user until it expires.
 *
 *   npm run auth:capture                 # valid login only
 *   npm run auth:capture -- --negative   # also records the wrong-password message
 *
 * In a real engagement the fix is a Turnstile test sitekey (always passes) on
 * staging, which removes this step entirely. See docs/test-plan.md, Dependencies.
 */
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { env } from '../src/config/env';
import { AUTH_FILE, AUTH_EVIDENCE_FILE } from '../src/config/paths';

const HUMAN_TIMEOUT_MS = Number(process.env.HUMAN_TIMEOUT_MS ?? 600_000);
const qa = (page: Page, id: string) => page.locator(`[data-qa-id="${id}"]`);

async function submitAfterHuman(page: Page, password: string): Promise<void> {
  await qa(page, 'input-email').fill(env.email);
  await qa(page, 'input-password').fill(password);
  console.log('\n>>> Tick "Verify you are human" in the browser window. The script submits by itself.\n');
  await qa(page, 'btn-save').and(page.locator(':enabled')).waitFor({ timeout: HUMAN_TIMEOUT_MS });
  await qa(page, 'btn-save').click();
}

async function main(): Promise<void> {
  const negative = process.argv.includes('--negative');
  const browser = await chromium.launch({ headless: false, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();
  const evidence: Record<string, unknown> = { capturedAt: new Date().toISOString() };

  page.on('response', async (res) => {
    if (!res.url().includes('graphql') || res.request().method() !== 'POST') return;
    const op = /"operationName":"(\w+)"/.exec(res.request().postData() ?? '')?.[1] ?? '';
    if (/login|auth|sign/i.test(op)) {
      const body = (await res.text().catch(() => '')).slice(0, 600);
      const redacted = body.replace(/"(\w*[Tt]oken)":"[^"]+"/g, '"$1":"<redacted>"');
      const entries = (evidence[op] as unknown[] | undefined) ?? [];
      entries.push({ status: res.status(), body: redacted });
      evidence[op] = entries;
    }
  });

  await page.goto(`${env.desktopBaseUrl}/login`, { waitUntil: 'domcontentloaded' });

  if (negative) {
    await submitAfterHuman(page, 'Wrong-Password-123!');
    await page.waitForTimeout(4_000);
    evidence.wrongPasswordScreenText = (await page.locator('main').innerText()).slice(0, 600);
    await page.screenshot({ path: 'docs/evidence/auth-wrong-password.png' });
    console.log('Recorded wrong-password response.');
    await page.reload({ waitUntil: 'domcontentloaded' });
  }

  await submitAfterHuman(page, env.password);
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 });
  await page.waitForLoadState('domcontentloaded');

  mkdirSync('.auth', { recursive: true });
  await context.storageState({ path: AUTH_FILE });
  evidence.postLoginUrl = page.url();
  evidence.cookieNames = (await context.cookies()).filter((c) => c.domain.includes('kumparan')).map((c) => `${c.name}@${c.domain}`);
  writeFileSync(AUTH_EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  console.log(`Session saved to ${AUTH_FILE}. Landing URL: ${page.url()}`);
  await browser.close();
}

main().catch((err) => { console.error(err); process.exit(1); });

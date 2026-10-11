import type { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';

/** Known-good fallback when the homepage cannot be parsed (e.g. a markup change). */
const FALLBACK_ARTICLE =
  '/kumparannews/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX';

/** Story URLs look like /<channel>/<slug>-<11-char id>. */
const STORY_PATH =
  /href="(?:https:\/\/kumparan\.com)?(\/kumparan(?:news|bisnis|tech|oto|hits|bola|food|mom|woman)\/[a-z0-9-]+-[0-9A-Za-z]{11})"/g;

export async function findFreshArticlePath(request: APIRequestContext): Promise<string> {
  try {
    const res = await request.get(env.desktopBaseUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      },
      timeout: 20_000,
    });
    const html = await res.text();
    const paths = [...html.matchAll(STORY_PATH)].map((m) => m[1]).filter((p): p is string => Boolean(p));
    return paths[0] ?? FALLBACK_ARTICLE;
  } catch {
    return FALLBACK_ARTICLE;
  }
}

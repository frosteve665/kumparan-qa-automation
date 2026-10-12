/**
 * Builds the README media from one evidence run:
 *   docs/media/*.gif         test videos turned into GIFs (hero + one per web bug)
 *   docs/media/bug-00{4,5}   image cards for the API bugs (no video for an API call)
 *   docs/media/dashboard.png screenshot of the evidence dashboard
 *   docs/sample-report/      the run itself, media compressed, served by GitHub Pages
 *
 *   npm run docs:media -- <runId>        (default: latest run in reports/runs)
 *
 * Needs ffmpeg on PATH.
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runs = readdirSync('reports/runs').sort();
const runId = process.argv[2] ?? runs.at(-1)!;
const RUN = join('reports/runs', runId);
const MEDIA = 'docs/media';
const SAMPLE = 'docs/sample-report';
mkdirSync(MEDIA, { recursive: true });

const ffmpeg = (...args: string[]) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

interface Gif {
  out: string;
  folder: string;
  /** Pick the video of a specific tab, e.g. "video-1" for a tab opened during the test. */
  video?: string;
  width: number;
  speed?: number;
}

const GIFS: Gif[] = [
  { out: 'demo-report-form-desktop.gif', folder: 'PASS_TC-RPT-001_desktop-chrome', width: 960 },
  { out: 'demo-side-menu-mobile.gif', folder: 'PASS_TC-NAV-002_mobile-chrome', width: 360 },
  { out: 'bug-001.gif', folder: 'DEFECT_TC-RPT-009_desktop-chrome', video: 'video-1', width: 960 },
  { out: 'bug-002.gif', folder: 'DEFECT_TC-RPT-012_desktop-chrome', width: 960, speed: 1.5 },
  { out: 'bug-003.gif', folder: 'DEFECT_TC-NAV-005_desktop-chrome', width: 960 },
  { out: 'bug-006.gif', folder: 'DEFECT_TC-AGT-009_desktop-chrome', width: 960, speed: 1.5 },
];

function videoIn(folder: string, prefer?: string): string {
  const videos = readdirSync(join(RUN, folder)).filter((f) => f.endsWith('.webm'));
  const pick = prefer ? videos.find((v) => v.includes(prefer)) : videos.find((v) => !/video-\d/.test(v));
  return join(RUN, folder, pick ?? videos[0]!);
}

for (const g of GIFS) {
  const speed = g.speed ? `setpts=PTS/${g.speed},` : '';
  const filter = `${speed}fps=8,scale=${g.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`;
  ffmpeg('-i', videoIn(g.folder, g.video), '-filter_complex', filter, '-loop', '0', join(MEDIA, g.out));
  console.log(`${g.out}: ${(statSync(join(MEDIA, g.out)).size / 1024).toFixed(0)} KB`);
}

// Sample report: copy the run, then shrink videos and screenshots so it fits a repository.
rmSync(SAMPLE, { recursive: true, force: true });
cpSync(RUN, SAMPLE, { recursive: true });
for (const folder of readdirSync(SAMPLE).filter((f) => statSync(join(SAMPLE, f)).isDirectory())) {
  for (const file of readdirSync(join(SAMPLE, folder))) {
    const path = join(SAMPLE, folder, file);
    const tmp = `${path}.tmp${file.slice(file.lastIndexOf('.'))}`;
    if (file.endsWith('.webm')) {
      ffmpeg('-i', path, '-vf', "scale='min(960,iw)':-2", '-c:v', 'libvpx-vp9', '-crf', '42', '-b:v', '0', '-an', tmp);
    } else if (file.endsWith('.png')) {
      ffmpeg('-i', path, '-vf', 'scale=iw/2:-1', tmp);
    } else continue;
    rmSync(path);
    cpSync(tmp, path);
    rmSync(tmp);
  }
}
const index = join(SAMPLE, 'index.html');
writeFileSync(
  index,
  readFileSync(index, 'utf8').replace(
    ' · <a href="../../index.html">run history</a>',
    ' · sample run published from <a href="https://github.com/frosteve665/kumparan-qa-automation">the repository</a>',
  ),
);
if (!existsSync('docs/.nojekyll')) writeFileSync('docs/.nojekyll', '');

// Screenshot of the dashboard and image cards for the API bugs.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(index).href);
await page.screenshot({ path: join(MEDIA, 'dashboard.png') });

const card = (title: string, request: string, response: string, verdict: string) => `
<body style="margin:0;background:#0d1117">
<div id="card" style="background:#0d1117;font:14px/1.5 ui-monospace,Consolas,monospace;color:#e6edf3;padding:24px;width:860px">
  <div style="font:600 16px system-ui;margin-bottom:12px">${title}</div>
  <div style="color:#8b949e">POST https://graphqlzero.almansi.me/api</div>
  <pre style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:12px;white-space:pre-wrap">${request}</pre>
  <div style="color:#8b949e">Response 200</div>
  <pre style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:12px;white-space:pre-wrap">${response}</pre>
  <div style="font:600 14px system-ui;color:#ff7b72">${verdict}</div>
</div></body>`;
const cards = [
  {
    out: 'bug-004.png',
    html: card(
      'BUG-004 · post that does not exist',
      'query GetPost($id: ID!) { post(id: $id) { id title body user { id } } }\nvariables: { "id": "999999" }',
      '{ "data": { "post": { "id": null, "title": null, "body": null, "user": { "id": null } } } }',
      'Expected "post": null. Got a ghost post with every field null.',
    ),
  },
  {
    out: 'bug-005.png',
    html: card(
      'BUG-005 · negative page limit',
      'query ListPosts($o: PageQueryOptions) { posts(options: $o) { data { id } } }\nvariables: { "o": { "paginate": { "page": 1, "limit": -5 } } }',
      '{ "data": { "posts": { "data": [ { "id": "1" }, { "id": "2" }, ... 95 posts ] } } }   errors: none',
      'Expected BAD_USER_INPUT. Got 95 rows (limit -1 returns 99; limit 0 silently becomes 10).',
    ),
  },
];
for (const c of cards) {
  await page.setContent(c.html);
  await page.locator('#card').screenshot({ path: join(MEDIA, c.out) });
}
await browser.close();

const size = (dir: string): number =>
  readdirSync(dir).reduce((sum, f) => {
    const p = join(dir, f);
    return sum + (statSync(p).isDirectory() ? size(p) : statSync(p).size);
  }, 0);
console.log(`sample report: ${(size(SAMPLE) / 1048576).toFixed(1)} MB · media: ${(size(MEDIA) / 1048576).toFixed(1)} MB`);

import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { classifyFailure, type FailureCategory } from './failure-classifier';

/**
 * QA evidence dashboard.
 *
 * Every run gets its own folder, reports/runs/<YYYY-MM-DD-HH-mm-ss>/, holding:
 *   index.html                       coverage matrix (test case x platform) and
 *                                    one row per execution, video playable inline
 *   <STATUS>_<ID>_<project>[_n]/     that execution's video, screenshot, trace
 *   results.json                     machine-readable results
 * reports/index.html lists the last N runs (REPORT_KEEP_RUNS, default 5).
 *
 *   PASS     passed on the first attempt
 *   FLAKY    passed only after a retry: tracked, never counted as a clean pass
 *   DEFECT   a product defect: an outcome assertion failed, or a known defect
 *            (test.fail + issue annotation) still reproduces
 *   FAIL     environment or script error: ours to fix, not a product finding
 *   SKIPPED  not executed, reason shown
 */
type Status = 'PASS' | 'FLAKY' | 'DEFECT' | 'FAIL' | 'SKIPPED';

interface Row {
  id: string;
  title: string;
  project: string;
  file: string;
  tags: string[];
  status: Status;
  category?: FailureCategory;
  note: string;
  durationMs: number;
  evidence: { name: string; href: string }[];
  anchor: string;
}

interface RunSummary {
  runId: string;
  status: string;
  durationMs: number;
  counts: Record<Status, number>;
}

const STATUSES: Status[] = ['PASS', 'FLAKY', 'DEFECT', 'FAIL', 'SKIPPED'];
/** Which status a matrix cell shows when one test case has several executions (data-driven rows). */
const SEVERITY: Status[] = ['FAIL', 'DEFECT', 'FLAKY', 'PASS', 'SKIPPED'];
const ID = /\[(TC-[A-Z]+-\d{3})\]/;
const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

const STYLE = `
:root{--bg:#f7f8fa;--card:#fff;--ink:#16181d;--muted:#667085;--line:#e4e7ec;--pass:#12805c;--flaky:#b54708;--defect:#c01048;--fail:#6941c6;--skip:#667085}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--card:#171a21;--ink:#e6e8ec;--muted:#98a2b3;--line:#2a2f3a}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1200px;margin:0 auto;padding:24px 16px}h1{margin:0;font-size:22px}h2{font-size:16px;margin:28px 0 10px}.muted{color:var(--muted);font-size:12px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:18px 0}
.tile{background:var(--card);border:1px solid var(--line);border-top:3px solid var(--c);border-radius:10px;padding:12px}
.tile b{display:block;font-size:26px}.tile span{color:var(--muted);font-size:12px;letter-spacing:.06em}
.s-PASS{--c:var(--pass)}.s-FLAKY{--c:var(--flaky)}.s-DEFECT{--c:var(--defect)}.s-FAIL{--c:var(--fail)}.s-SKIPPED{--c:var(--skip)}
.wrap{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:10px}table{border-collapse:collapse;width:100%}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{font-size:12px;color:var(--muted);font-weight:600}
.id{font-family:ui-monospace,Consolas,monospace;white-space:nowrap}
.pill{display:inline-block;padding:1px 8px;border-radius:99px;font-size:11px;font-weight:700;color:#fff;background:var(--c);text-decoration:none;white-space:nowrap}
.tag{display:inline-block;margin-left:4px;padding:0 6px;border:1px solid var(--line);border-radius:99px;font-size:11px}
.note{font-size:12px;color:var(--muted);max-width:340px}.na{color:var(--muted)}a{color:inherit}
details summary{cursor:pointer;font-size:12px}video{display:block;width:100%;max-width:360px;margin-top:6px;border-radius:6px;background:#000}
`;

export default class EvidenceReporter implements Reporter {
  private readonly rootDir: string;
  private readonly keepRuns: number;
  private readonly rows: Row[] = [];
  private readonly startedAt = new Date();
  private readonly runId = this.startedAt.toISOString().replace(/[:T]/g, '-').slice(0, 19);
  private readonly outputDir: string;
  private readonly folderUse = new Map<string, number>();

  constructor(options: { outputDir?: string; keepRuns?: number } = {}) {
    this.rootDir = options.outputDir ?? 'reports';
    this.keepRuns = Number(process.env.REPORT_KEEP_RUNS ?? options.keepRuns ?? 5);
    this.outputDir = join(this.rootDir, 'runs', this.runId);
  }

  onBegin(): void {
    mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // Final when the outcome is what the test expects (a known defect's
    // expected status is "failed", so it is never retried) or retries are spent.
    const isFinalAttempt =
      result.status === 'skipped' || result.status === test.expectedStatus || result.retry >= test.retries;
    if (!isFinalAttempt) return;

    const project = test.parent.project()?.name ?? 'default';
    const id = ID.exec(test.title)?.[1] ?? 'UNTRACKED';
    const { status, category, note } = this.triage(test, result);

    // Data-driven cases share an ID: number repeated folders instead of overwriting.
    const base = `${status}_${id}_${project}`;
    const n = (this.folderUse.get(base) ?? 0) + 1;
    this.folderUse.set(base, n);
    const folder = n === 1 ? base : `${base}_${n}`;

    const evidence: Row['evidence'] = [];
    for (const attachment of result.attachments) {
      if (!attachment.path) continue;
      const name = `${attachment.name}-${basename(attachment.path)}`;
      try {
        mkdirSync(join(this.outputDir, folder), { recursive: true });
        copyFileSync(attachment.path, join(this.outputDir, folder, name));
        evidence.push({ name: attachment.name, href: `${folder}/${name}` });
      } catch {
        // Attachment already cleaned up by Playwright: the HTML report still has it.
      }
    }

    this.rows.push({
      id,
      title: test.title.replace(ID, '').trim(),
      project,
      file: test.location.file.split(/[\\/]tests[\\/]/)[1] ?? test.location.file,
      tags: test.tags,
      status,
      note,
      durationMs: result.duration,
      evidence,
      anchor: folder,
      ...(category ? { category } : {}),
    });
  }

  onEnd(result: FullResult): void {
    // `--list` and empty selections produce no executions: leave no empty run behind.
    if (!this.rows.length) {
      rmSync(this.outputDir, { recursive: true, force: true });
      return;
    }
    mkdirSync(this.outputDir, { recursive: true });
    const summary: RunSummary = {
      runId: this.runId,
      status: result.status,
      durationMs: result.duration,
      counts: Object.fromEntries(STATUSES.map((s) => [s, this.rows.filter((r) => r.status === s).length])) as Record<
        Status,
        number
      >,
    };
    const data = JSON.stringify({ ...summary, startedAt: this.startedAt, rows: this.rows }, null, 2);
    writeFileSync(join(this.outputDir, 'results.json'), data);
    writeFileSync(join(this.outputDir, 'index.html'), this.render(result));
    // Latest run's data at a stable path, for CI summaries and scripts.
    writeFileSync(join(this.rootDir, 'results.json'), data);
    this.writeHistory();
    console.log(
      `\nEvidence dashboard: ${join(this.outputDir, 'index.html')}  (run history: ${join(this.rootDir, 'index.html')})`,
    );
  }

  private triage(test: TestCase, result: TestResult): { status: Status; category?: FailureCategory; note: string } {
    const linkedBug = test.annotations.find((a) => a.type === 'issue')?.description;
    const withBug = (note: string) => (linkedBug ? `${linkedBug}. ${note}` : note).trim();

    if (result.status === 'skipped') {
      const reason = test.annotations.find((a) => a.type === 'skip' || a.type === 'fixme')?.description ?? 'Skipped';
      return { status: 'SKIPPED', note: withBug(reason) };
    }
    // Known defects are marked with test.fail(): an actual "failed" means the
    // bug still reproduces; an actual "passed" means it may be fixed.
    if (test.expectedStatus === 'failed') {
      return result.status === 'failed'
        ? { status: 'DEFECT', category: 'bug', note: withBug('Known defect still reproduces') }
        : {
            status: 'FAIL',
            note: withBug('Known defect no longer reproduces: verify the fix, then remove test.fail()'),
          };
    }
    if (result.status === 'passed') {
      return {
        status: result.retry > 0 ? 'FLAKY' : 'PASS',
        note: withBug(result.retry > 0 ? `Passed on retry #${result.retry}` : ''),
      };
    }
    const c = classifyFailure(result.errors.map((e) => e.message ?? '').join('\n'));
    return {
      status: c.category === 'bug' ? 'DEFECT' : 'FAIL',
      category: c.category,
      note: withBug(`${c.category}: ${c.reason}`),
    };
  }

  /** Keeps the last N runs and writes reports/index.html, the run history. */
  private writeHistory(): void {
    const runsDir = join(this.rootDir, 'runs');
    const runs = readdirSync(runsDir)
      .filter((d) => existsSync(join(runsDir, d, 'results.json')))
      .sort()
      .reverse();
    for (const old of runs.slice(this.keepRuns)) rmSync(join(runsDir, old), { recursive: true, force: true });
    const kept = runs
      .slice(0, this.keepRuns)
      .map((d) => JSON.parse(readFileSync(join(runsDir, d, 'results.json'), 'utf8')) as RunSummary);
    const rows = kept
      .map(
        (
          r,
          i,
        ) => `<tr><td><a href="runs/${r.runId}/index.html">${r.runId}</a>${i === 0 ? ' <span class="pill s-PASS">latest</span>' : ''}</td>
<td>${r.status.toUpperCase()}</td><td>${(r.durationMs / 1000).toFixed(0)}s</td>${STATUSES.map((s) => `<td><span class="pill s-${s}">${r.counts[s] ?? 0}</span></td>`).join('')}</tr>`,
      )
      .join('');
    writeFileSync(
      join(this.rootDir, 'index.html'),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>kumparan QA Runs</title><style>${STYLE}</style></head><body><main>
<h1>kumparan QA run history</h1>
<div class="muted">Last ${kept.length} runs; older runs are pruned (REPORT_KEEP_RUNS). Each run has its own dashboard with per-test video evidence.</div>
<h2>Runs</h2><div class="wrap"><table><thead><tr><th>Run</th><th>Result</th><th>Duration</th>${STATUSES.map((s) => `<th>${s}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
</main></body></html>`,
    );
  }

  private render(result: FullResult): string {
    const count = (s: Status) => this.rows.filter((r) => r.status === s).length;
    const projects = [...new Set(this.rows.map((r) => r.project))].sort();
    const ids = [...new Set(this.rows.map((r) => r.id))].sort();
    const executed = this.rows.filter((r) => r.status !== 'SKIPPED').length;
    const passRate = executed ? Math.round(((count('PASS') + count('FLAKY')) / executed) * 100) : 0;
    const rowsSorted = [...this.rows].sort((a, b) => a.id.localeCompare(b.id) || a.project.localeCompare(b.project));

    const tiles = STATUSES.map((s) => `<div class="tile s-${s}"><b>${count(s)}</b><span>${s}</span></div>`).join('');
    const matrix = ids
      .map((id) => {
        const title = this.rows.find((r) => r.id === id)?.title ?? '';
        const cells = projects
          .map((p) => {
            const runs = this.rows.filter((x) => x.id === id && x.project === p);
            if (!runs.length) return '<td class="na">n/a</td>';
            const worst = SEVERITY.find((s) => runs.some((r) => r.status === s))!;
            const target = runs.find((r) => r.status === worst)!;
            const times = runs.length > 1 ? ` ×${runs.length}` : '';
            return `<td><a class="pill s-${worst}" href="#${target.anchor}" title="${esc(target.note)}">${worst}${times}</a></td>`;
          })
          .join('');
        return `<tr><td class="id">${id}</td><td>${esc(title)}</td>${cells}</tr>`;
      })
      .join('');
    const details = rowsSorted
      .map(
        (r) => `
<tr id="${r.anchor}"><td class="id">${r.id}</td>
<td>${esc(r.title)}<div class="muted">${esc(r.file)} ${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></td>
<td>${r.project}</td><td><span class="pill s-${r.status}">${r.status}</span></td><td>${(r.durationMs / 1000).toFixed(1)}s</td>
<td class="note">${esc(r.note)}</td><td>${evidenceCell(r)}</td></tr>`,
      )
      .join('');

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>kumparan QA Evidence</title><style>${STYLE}</style></head><body><main>
<h1>kumparan QA Evidence Dashboard</h1>
<div class="muted">Run ${this.runId} · overall ${result.status.toUpperCase()} · ${this.rows.length} executions across ${projects.length} projects · ${passRate}% of executed tests passed · <a href="../../index.html">run history</a></div>
<div class="tiles">${tiles}</div>
<h2>Coverage matrix: each test case on each platform</h2>
<div class="wrap"><table><thead><tr><th>ID</th><th>Test case</th>${projects.map((p) => `<th>${p}</th>`).join('')}</tr></thead><tbody>${matrix}</tbody></table></div>
<h2>Executions and evidence</h2>
<div class="wrap"><table><thead><tr><th>ID</th><th>Test</th><th>Project</th><th>Status</th><th>Time</th><th>Triage note</th><th>Evidence</th></tr></thead><tbody>${details}</tbody></table></div>
<p class="muted">PASS: first attempt · FLAKY: passed after a retry · DEFECT: product defect (outcome assertion failed, or a known defect still reproduces; see docs/bugs) · FAIL: environment or script error · SKIPPED: not executed, reason shown. ×N: data-driven case executed N times; the cell shows the worst result.</p>
</main></body></html>`;
  }
}

/** Video plays inline (loaded on demand); other evidence is linked. */
function evidenceCell(r: Row): string {
  const video = r.evidence.find((e) => e.name === 'video');
  const links = r.evidence
    .filter((e) => e.name !== 'video')
    .map((e) => `<a href="${e.href}">${esc(e.name)}</a>`)
    .join(' · ');
  const player = video
    ? `<details><summary>▶ Play video</summary><video controls preload="none" src="${video.href}"></video></details>`
    : '';
  return player + (links ? `<div>${links}</div>` : '') || '<span class="muted">none</span>';
}

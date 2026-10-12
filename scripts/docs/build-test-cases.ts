/**
 * Renders test-design/catalog.ts to docs/test-cases.md and docs/test-cases.xlsx,
 * merged with the latest execution results (reports/results.json) and the
 * manual execution log (test-design/manual-results.ts).
 *
 *   npm run docs:test-cases
 */
import ExcelJS from 'exceljs';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { CATALOG, MODULES, type TestCase } from '../../test-design/catalog';
import { MANUAL_RESULTS } from '../../test-design/manual-results';

type Status = 'PASS' | 'FLAKY' | 'DEFECT' | 'FAIL' | 'SKIPPED';
interface ResultRow { id: string; project: string; status: Status }

const SEVERITY: Status[] = ['FAIL', 'DEFECT', 'FLAKY', 'PASS', 'SKIPPED'];
const PROJECTS = ['desktop-chrome', 'mobile-chrome', 'mobile-safari', 'api-graphql'] as const;

const results: ResultRow[] = existsSync('reports/results.json')
  ? (JSON.parse(readFileSync('reports/results.json', 'utf8')) as { rows: ResultRow[] }).rows
  : [];
const runId = existsSync('reports/results.json') ? (JSON.parse(readFileSync('reports/results.json', 'utf8')) as { runId?: string }).runId ?? '' : '';

/** Worst status of a case on a project (data-driven cases run several times). */
function statusOn(id: string, project: string): Status | '' {
  const runs = results.filter((r) => r.id === id && r.project === project);
  return SEVERITY.find((s) => runs.some((r) => r.status === s)) ?? '';
}

function result(tc: TestCase): { cells: Record<string, string>; overall: string } {
  const manual = MANUAL_RESULTS[tc.id];
  if (manual) return { cells: { manual: `${manual.status} (${manual.date})` }, overall: manual.status };
  const cells: Record<string, string> = {};
  for (const p of PROJECTS) cells[p] = statusOn(tc.id, p);
  const seen = Object.values(cells).filter(Boolean) as Status[];
  const overall = seen.length ? SEVERITY.find((s) => seen.includes(s))! : tc.automation.startsWith('Planned') ? 'PLANNED' : 'NOT RUN';
  return { cells, overall };
}

const md: string[] = [
  '# Test cases',
  '',
  'Generated from `test-design/catalog.ts` by `npm run docs:test-cases`. Do not edit by hand.',
  `Execution status from run \`${runId || 'n/a'}\` (reports/results.json) and the manual log (test-design/manual-results.ts).`,
  'Also available as a spreadsheet: [test-cases.xlsx](test-cases.xlsx).',
  '',
  '**Legend.** Type: Positive / Negative / Boundary / Edge. Priority: P1 (blocks a core business function), P2 (degrades it), P3 (cosmetic or rare).',
  'Status: PASS · FLAKY (passed after retry) · DEFECT (product defect, see docs/bugs) · FAIL (environment/script) · SKIPPED · NOT RUN.',
  '',
  '## Summary',
  '',
  '| Module | Cases | P1 | Positive | Negative | Boundary | Edge | Automated |',
  '|---|---|---|---|---|---|---|---|',
];
for (const [key, name] of Object.entries(MODULES)) {
  const cs = CATALOG.filter((c) => c.module === key);
  if (!cs.length) continue;
  const n = (f: (c: TestCase) => boolean) => cs.filter(f).length;
  md.push(`| ${name} | ${cs.length} | ${n((c) => c.priority === 'P1')} | ${n((c) => c.type === 'Positive')} | ${n((c) => c.type === 'Negative')} | ${n((c) => c.type === 'Boundary')} | ${n((c) => c.type === 'Edge')} | ${n((c) => c.automation.startsWith('Automated'))} |`);
}
md.push(`| **Total** | **${CATALOG.length}** | **${CATALOG.filter((c) => c.priority === 'P1').length}** | | | | | **${CATALOG.filter((c) => c.automation.startsWith('Automated')).length}** |`, '');

for (const [key, name] of Object.entries(MODULES)) {
  const cs = CATALOG.filter((c) => c.module === key);
  if (!cs.length) continue;
  md.push(`## ${name}`, '', '| ID | Test case | Type | Pri | Platforms | Automation | Status |', '|---|---|---|---|---|---|---|');
  for (const tc of cs) {
    const r = result(tc);
    const status = MANUAL_RESULTS[tc.id] ? r.cells.manual : PROJECTS.filter((p) => r.cells[p]).map((p) => `${p.replace('-chrome', '').replace('-safari', ' safari').replace('api-graphql', 'api')}: ${r.cells[p]}`).join('<br>') || r.overall;
    md.push(`| [${tc.id}](#${tc.id.toLowerCase()}) | ${tc.title}${tc.defect ? ` (${tc.defect})` : ''}${tc.covers ? `<br>*Automates Task A: ${tc.covers.join(', ')}*` : ''} | ${tc.type} | ${tc.priority} | ${tc.platforms.join(', ')} | ${tc.automation} | ${status} |`);
  }
  md.push('');
}

md.push('## Task C traceability: Task A cases automated by Playwright Agent', '', 'Each agent-generated test (planner -> generator -> healer, reviewed) and the Task A cases it automates.', '', '| Agent test | Platform | Automates Task A cases |', '|---|---|---|');
for (const tc of CATALOG.filter((c) => c.covers)) md.push(`| ${tc.id}: ${tc.title} | ${tc.platforms.join(', ')} | ${tc.covers!.join(', ')} |`);
const covered = new Set(CATALOG.flatMap((c) => c.covers ?? []));
md.push('', `${covered.size} distinct Task A cases are automated a second time by the agent, on desktop and mobile.`, '');
md.push('## Case details', '');
for (const tc of CATALOG) {
  md.push(`### ${tc.id}`, '', `**${tc.title}** · ${tc.type} · ${tc.priority} · ${tc.platforms.join(', ')} · ${tc.automation}${tc.defect ? ` · linked defect ${tc.defect}` : ''}`, '');
  md.push(`- **Risk:** ${tc.risk}`, `- **Preconditions:** ${tc.preconditions}`);
  if (tc.data) md.push(`- **Test data:** ${tc.data}`);
  md.push('- **Steps:**', ...tc.steps.map((s, i) => `  ${i + 1}. ${s}`), `- **Expected:** ${tc.expected}`);
  if (tc.spec) md.push(`- **Automation:** \`${tc.spec}\``);
  if (tc.covers) md.push(`- **Automates Task A cases:** ${tc.covers.join(', ')}`);
  const manual = MANUAL_RESULTS[tc.id];
  if (manual) md.push(`- **Manual execution:** ${manual.status} on ${manual.date}. ${manual.actual}${manual.evidence ? ` Evidence: ${manual.evidence}` : ''}`);
  md.push('');
}
writeFileSync('docs/test-cases.md', md.join('\n'));

async function xlsx(): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'kumparan QA automation';
  const ws = wb.addWorksheet('Test cases', { views: [{ state: 'frozen', ySplit: 1, xSplit: 1 }] });
  ws.columns = [
    { header: 'ID', key: 'id', width: 13 }, { header: 'Module', key: 'module', width: 20 }, { header: 'Test case', key: 'title', width: 52 },
    { header: 'Type', key: 'type', width: 10 }, { header: 'Priority', key: 'priority', width: 8 }, { header: 'Platforms', key: 'platforms', width: 15 },
    { header: 'Automation', key: 'automation', width: 30 }, { header: 'Risk', key: 'risk', width: 36 }, { header: 'Preconditions', key: 'pre', width: 28 },
    { header: 'Test data', key: 'data', width: 24 }, { header: 'Steps', key: 'steps', width: 50 }, { header: 'Expected result', key: 'expected', width: 50 },
    { header: 'Desktop', key: 'desktop-chrome', width: 11 }, { header: 'Mobile', key: 'mobile-chrome', width: 11 }, { header: 'Mobile Safari', key: 'mobile-safari', width: 12 },
    { header: 'API', key: 'api-graphql', width: 9 }, { header: 'Overall', key: 'overall', width: 12 }, { header: 'Defect', key: 'defect', width: 10 }, { header: 'Automates Task A', key: 'covers', width: 26 }, { header: 'Spec', key: 'spec', width: 44 },
  ];
  const fill = (argb: string) => ({ type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb } });
  const COLORS: Record<string, string> = { PLANNED: 'FFF2F4F7', PASS: 'FFD1FADF', FLAKY: 'FFFEF0C7', DEFECT: 'FFFEE4E2', FAIL: 'FFEBE9FE', SKIPPED: 'FFF2F4F7', 'NOT RUN': 'FFF2F4F7' };
  for (const tc of CATALOG) {
    const r = result(tc);
    const row = ws.addRow({
      id: tc.id, module: MODULES[tc.module], title: tc.title, type: tc.type, priority: tc.priority, platforms: tc.platforms.join(', '),
      automation: tc.automation, risk: tc.risk, pre: tc.preconditions, data: tc.data ?? '', steps: tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      expected: tc.expected, ...r.cells, overall: r.overall, defect: tc.defect ?? '', covers: tc.covers?.join(', ') ?? '', spec: tc.spec ?? '',
    });
    row.alignment = { vertical: 'top', wrapText: true };
    for (const key of [...PROJECTS, 'overall']) {
      const cell = row.getCell(key);
      const v = String(cell.value ?? '').split(' ')[0] ?? '';
      if (COLORS[v]) cell.fill = fill(COLORS[v]);
    }
  }
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = fill('FF1F2937');
  header.alignment = { vertical: 'middle', wrapText: true };
  ws.autoFilter = { from: 'A1', to: 'T1' };
  await wb.xlsx.writeFile('docs/test-cases.xlsx');
}

await xlsx();

/** README: one heading per module (so the user-story table can link to it) and a collapsible table. */
function readmeBlock(): string {
  const ICON: Record<string, string> = { PASS: '✅', FLAKY: '⚠️', DEFECT: '🐞', FAIL: '❌', SKIPPED: '⏭️' };
  const LETTER: Record<string, string> = { 'desktop-chrome': 'D', 'mobile-chrome': 'M', 'mobile-safari': 'S', 'api-graphql': 'A' };
  const out: string[] = [];
  for (const [key, name] of Object.entries(MODULES)) {
    const cases = CATALOG.filter((c) => c.module === key);
    if (!cases.length) continue;
    const p1 = cases.filter((c) => c.priority === 'P1').length;
    out.push(`### ${name}`, '', `<details><summary>${cases.length} cases · ${p1} P1</summary>`, '');
    out.push('| ID | Test case | Type | Priority | Result |', '|---|---|---|---|---|');
    for (const tc of cases) {
      const result =
        PROJECTS.map((p) => (statusOn(tc.id, p) ? `${ICON[statusOn(tc.id, p)] ?? ''} ${LETTER[p]}` : ''))
          .filter(Boolean)
          .join(' · ') || 'not run';
      const id = tc.spec ? `[${tc.id}](${tc.spec})` : tc.id;
      const bug = tc.defect ? ` ([${tc.defect}](docs/bugs/${tc.defect}.md))` : '';
      out.push(`| ${id} | ${tc.title}${bug} | ${tc.type} | ${tc.priority} | ${result} |`);
    }
    out.push('', '</details>', '');
  }
  out.push('Result: ✅ pass · 🐞 known bug reproduced · ⚠️ passed on retry · ❌ fail.');
  return out.join('\n');
}

const README = 'README.md';
const readme = readFileSync(README, 'utf8');
const start = '<!-- TEST-CASES:START -->';
const end = '<!-- TEST-CASES:END -->';
if (readme.includes(start) && readme.includes(end)) {
  const before = readme.slice(0, readme.indexOf(start) + start.length);
  const after = readme.slice(readme.indexOf(end));
  writeFileSync(README, `${before}\n${readmeBlock()}\n${after}`);
}
console.log(`docs/test-cases.md, docs/test-cases.xlsx and README.md updated: ${CATALOG.length} cases`);

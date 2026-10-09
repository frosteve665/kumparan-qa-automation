// Prints the latest run as a Markdown table for the GitHub Actions job summary.
import { existsSync, readFileSync } from 'node:fs';

if (!existsSync('reports/results.json')) {
  console.log('No results: the run did not reach the reporter.');
  process.exit(0);
}
const { runId, counts, rows } = JSON.parse(readFileSync('reports/results.json', 'utf8'));
const icon = { PASS: '✅', FLAKY: '🟡', DEFECT: '🐞', FAIL: '❌', SKIPPED: '⏭️' };
console.log(`### Run ${runId}`);
console.log('');
console.log(Object.entries(counts).map(([s, n]) => `${icon[s] ?? ''} ${s}: **${n}**`).join(' · '));
const notable = rows.filter((r) => r.status !== 'PASS' && r.status !== 'SKIPPED');
if (notable.length) {
  console.log('');
  console.log('| ID | Project | Status | Note |');
  console.log('|---|---|---|---|');
  for (const r of notable) console.log(`| ${r.id} | ${r.project} | ${icon[r.status]} ${r.status} | ${r.note.replace(/\|/g, '\\|').slice(0, 160)} |`);
}
console.log('');
console.log('Full evidence (videos, screenshots, traces): download the `evidence-*` artifact and open `reports/index.html`.');

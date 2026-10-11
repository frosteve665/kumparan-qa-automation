/**
 * Site Explorer, digest step: turns knowledge/flow-map.json into a compact,
 * human- and agent-readable knowledge/flow-digest.md (tables plus a Mermaid
 * flow diagram per page). The explorer agent reads this instead of the raw
 * JSON, which keeps its context small.
 *
 *   npm run explore:digest
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

interface FlowAction {
  page: string;
  platform: string;
  view: string;
  element: string;
  label: string;
  type: string;
  lands?: string;
  revealed: string[];
  messages: string[];
  network: string[];
  note?: string;
}

const files = ['knowledge/flow-map.json', 'knowledge/flow-map.signed-in.json'].filter((f) => existsSync(f));
const STORY = /\/[a-z0-9-]+-[0-9A-Za-z]{11}(\/full)?$/;
const actions: FlowAction[] = files
  .flatMap((f) => (JSON.parse(readFileSync(f, 'utf8')) as { actions: FlowAction[] }).actions)
  .map((a) => (a.lands ? { ...a, lands: a.lands.replace(STORY, '/:story-slug$1') } : a));
const meta = JSON.parse(readFileSync('knowledge/flow-map.json', 'utf8')) as {
  generatedAt: string;
  sampleArticle: string;
};

const TYPE_LABEL: Record<string, string> = {
  navigation: 'navigates',
  'login-required': 'LOGIN REQUIRED',
  modal: 'opens overlay',
  'state-change': 'changes state',
  'in-page': 'updates page',
  external: 'external link',
  input: 'input field',
  'no-effect': 'no visible effect',
  error: 'not exercisable',
};
const cell = (s: string) => s.replace(/\|/g, '\\|');
const node = (s: string) => s.replace(/[^A-Za-z0-9]/g, '_');

const out: string[] = [
  '# Flow digest',
  '',
  `Generated from the crawler run at ${meta.generatedAt} (sample story \`${meta.sampleArticle}\`).`,
  'Each row is one data-qa-id element clicked in a fresh browser: where it lands, what appears, and which GraphQL operations it fires.',
  'Regenerate with `npm run explore && npm run explore:digest`.',
  '',
];

const pages = [...new Set(actions.map((a) => a.page))];
for (const page of pages) {
  out.push(`## ${page}`, '');
  for (const platform of ['desktop', 'mobile']) {
    const rows = actions.filter((a) => a.page === page && a.platform === platform && a.type !== 'error');
    if (!rows.length) continue;
    out.push(
      `### ${page} · ${platform}`,
      '',
      '| Element | View | Effect | Lands on | Appears | API calls |',
      '|---|---|---|---|---|---|',
    );
    for (const a of rows) {
      out.push(
        `| \`${a.element}\` ${a.label ? `"${cell(a.label.slice(0, 30))}"` : ''} | ${a.view} | ${TYPE_LABEL[a.type] ?? a.type}${a.note && a.type === 'no-effect' ? ' (protected)' : ''} | ${a.lands ? `\`${cell(a.lands)}\`` : ''} | ${cell([...a.revealed.slice(0, 4), ...a.messages.slice(0, 1).map((m) => `"${m}"`)].join(', '))} | ${cell(a.network.slice(0, 3).join(', '))} |`,
      );
    }
    const flows = rows.filter((a) => a.lands || a.type === 'modal' || a.type === 'state-change');
    if (flows.length) {
      out.push('', '```mermaid', 'flowchart LR', `  P[${page} · ${platform}]`);
      for (const a of flows) {
        const target = a.lands ?? (a.type === 'modal' ? `${a.element} overlay` : `${a.element} state`);
        const style = a.type === 'login-required' ? '-.->|"login"|' : `-->|"${a.element}"|`;
        const edge = `  P ${style} ${node(target)}["${target.replace(/"/g, "'")}"]`;
        if (!out.includes(edge)) out.push(edge);
      }
      out.push('```');
    }
    out.push('');
  }
}

const notExercised = actions.filter((a) => a.type === 'error');
out.push(
  '## Not exercisable by the crawler',
  '',
  'Usually covered or animated elements (carousel controls, hidden drawers). Covered by targeted specs instead where they matter.',
  '',
);
for (const a of notExercised) out.push(`- ${a.platform} / ${a.page} / \`${a.element}\`: ${a.note ?? ''}`);

writeFileSync('knowledge/flow-digest.md', out.join('\n') + '\n');
console.log(`knowledge/flow-digest.md written (${actions.length} actions, ${pages.length} pages)`);

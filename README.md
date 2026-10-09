# kumparan QA Automation: an AI-assisted Playwright suite that maps the site, then proves 6 real defects

[![QA automation](https://github.com/frosteve665/kumparan-qa-automation/actions/workflows/e2e.yml/badge.svg)](https://github.com/frosteve665/kumparan-qa-automation/actions/workflows/e2e.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/platforms-desktop%20%C2%B7%20mobile%20%C2%B7%20GraphQL-555)
![Agents](https://img.shields.io/badge/Playwright%20Agents-planner%20%C2%B7%20generator%20%C2%B7%20healer-8A2BE2)

kumparan QA Engineer skill test: test design, Playwright desktop + mobile automation, Playwright
Agents, and GraphQL API testing, delivered as one framework.

## At a glance

| | |
|---|---|
| **Test cases** | **97** designed (85 automated, 2 human-assisted login checks, 10 signed-in cases planned behind the captcha session) ([docs/test-cases.md](docs/test-cases.md) · [xlsx](docs/test-cases.xlsx)), risk-based, Positive / Negative / Boundary / Edge |
| **Automated** | 85 cases → **186 executions** per full run across desktop Chrome, Pixel 7, iPhone 15 (smoke) and GraphQL |
| **Defects found** | **6** with reproducible evidence ([docs/bugs](docs/bugs)): 3 on kumparan web, 1 accessibility (found by an AI agent), 2 on the API; plus 6 documented observations |
| **Site knowledge** | A crawler clicked **183** `data-qa-id` actions on both sites; an explorer agent turned them into [feature maps](docs/features) |
| **Agents** | Playwright planner / generator / healer wrote **13** tests on desktop and mobile; every one reviewed ([REVIEW.md](tests/agent/REVIEW.md)) |
| **Evidence** | A video of **every** test with an on-screen caption (test ID · platform · step), dashboard with inline playback |
| **Safety** | A network write guard makes it impossible to publish a comment or report, even for an AI agent exploring production |

> Latest full regression (3.2 min): **161 PASS · 6 DEFECT** (known bugs, still reproducing) **· 1 FLAKY · 0 FAIL · 18 SKIPPED** by design. Details: [docs/findings.md](docs/findings.md).

## What makes it different

**1. It learns the site before testing it.** `npm run explore` clicks every `data-qa-id` element on
every page type, on desktop and mobile, in a fresh browser each time, and records where it lands,
whether login is required, what appears, and which GraphQL operation fires. The result
([knowledge/flow-digest.md](knowledge/flow-digest.md)) is the locator inventory, the input for the
AI agents, and a **UI-drift detector**: re-crawl and `knowledge/drift.md` lists every changed
button before a test breaks.

**2. One spec, two different sites.** kumparan.com and m.kumparan.com are separate front-ends.
Platform-aware page objects hide the differences (header vs burger menu, inline share vs share
modal), so each business rule is written once and proven on both.

**3. Evidence a reviewer can watch.** Every execution is recorded. A caption inside the video says
which test case, platform and step you are watching. The dashboard shows a coverage matrix
(case × platform) and a triage note for anything not green: environment, script error or product
defect. Known defects stay visible as DEFECT without breaking CI.

**4. AI agents with guardrails.** Playwright's planner, generator and healer explored the live
site from a seed that inherits the project fixtures (ad blocker, promo handler, **write guard**).
Their output was reviewed like a pull request; the healer also found a real accessibility defect
(BUG-006), which a human then confirmed.

## Findings

| ID | Finding | Platforms | Severity |
|---|---|---|---|
| [BUG-001](docs/bugs/BUG-001.md) | "Batal" on a directly opened report link leaves kumparan for `about:blank` | Desktop, mobile | Medium |
| [BUG-002](docs/bugs/BUG-002.md) | Address bar flips back to the story while the report form is shown (stale scroll listener) | Desktop, mobile (intermittent) | Low |
| [BUG-003](docs/bugs/BUG-003.md) | React hydration mismatch (#418) on the desktop homepage; late interactivity | Desktop | Medium |
| [BUG-004](docs/bugs/BUG-004.md) | API: unknown post id returns a ghost object instead of `null` | GraphQL | Medium |
| [BUG-005](docs/bugs/BUG-005.md) | API: negative page limit accepted, returns 95 rows | GraphQL | Medium |
| [BUG-006](docs/bugs/BUG-006.md) | Share modal is not an accessible dialog: Escape ignored, no `role="dialog"` | Desktop, mobile | Medium (a11y) |

Observations, coverage and exit-criteria assessment: [docs/findings.md](docs/findings.md).

## The four tasks

| Task | Where |
|---|---|
| **A. Test cases and risk analysis** | [Test plan](docs/test-plan.md) (scope, assumptions, out of scope, dependencies, data, entry/exit criteria) · [Test cases](docs/test-cases.md) · [xlsx](docs/test-cases.xlsx) · [Findings](docs/findings.md) · [Bug reports](docs/bugs) · [Feature maps](docs/features) |
| **B. Playwright website tests** | `tests/web/` · [Automation strategy](docs/automation-strategy.md) (parallelism, cleanup, timeouts, retries, flaky tests, locators) |
| **C. Playwright Agent tests** | `tests/agent/` · [Prompts used](docs/agent-prompts.md) · [Plans](specs/) · [Review](tests/agent/REVIEW.md) |
| **D. GraphQL API tests** | `tests/api/graphql/` · 19 cases: 7 queries, 3 mutations, negative, boundary and security, all with variables |

## Quick start

```bash
npm ci
npx playwright install chromium webkit
cp .env.example .env            # only needed for the signed-in session capture

npm test                        # everything
npm run test:desktop            # kumparan.com
npm run test:mobile             # m.kumparan.com (Pixel 7) + iPhone 15 smoke
npm run test:api                # GraphQL
npm run test:agent              # agent-generated tests
npx playwright test --grep @smoke
```

Then open **`reports/index.html`** (run history → dashboard → video per test) or `npm run report`
for Playwright's own HTML report.

**CI and kumparan's firewall.** kumparan blocks GitHub-hosted runners ("Sorry, you don't have
permission to access this website", verified from the first CI run's evidence). An environment
preflight detects this once per worker and **skips the web tests with that reason** instead of
reporting misleading failures; the GraphQL suite runs fully in CI. Run the web suite locally (as in
the results above) or on a self-hosted runner, where the same workflow runs it unchanged.

**Signed-in tests.** kumparan's login is protected by Cloudflare Turnstile, which must not be
automated. Run `npm run auth:capture` once: a browser opens, you tick "Verify you are human", and
the session is saved to `.auth/user.json` (gitignored) for every signed-in test. Without it those
tests are skipped with a reason, never silently passed. In CI, store the file base64-encoded as the
`AUTH_STATE_B64` secret.

## How it is built

```
src/
  pages/        platform-aware page objects (desktop + mobile behind one interface)
  fixtures/     auto fixtures: write guard, ad block, share stubs, promo handler, caption; API client
  support/      network rules, interruptions, caption, live test data, assertions
  api/          typed GraphQL client (variables only) + zod response contracts
  reporters/    evidence dashboard + failure classifier
tests/
  web/          hand-written specs (Task B)
  agent/        Playwright-agent specs (Task C) + REVIEW.md
  api/graphql/  GraphQL specs (Task D)
  seed.spec.ts  seed for the Playwright agents
test-design/    test case catalog → docs/test-cases.md + .xlsx
scripts/        site explorer, session capture, bug reproductions, docs and CI helpers
knowledge/      crawler output: flow map, digest, drift, screenshots
docs/           plan, cases, features, findings, bugs, strategy, agent prompts
.claude/        Playwright agents, site-explorer agent, kumparan-qa skill
```

Key decisions (details in [automation-strategy.md](docs/automation-strategy.md)):
- **Locators:** `data-qa-id` via `testIdAttribute`; documented anchors only where none exists.
- **Stability without sleeps:** wait for React to wire an element (`waitForInteractive`), retry a click until its effect appears, auto-dismiss the promo with `addLocatorHandler`, block ad hosts (one ads-on test keeps that honest).
- **Retries are reported, not hidden:** a pass after retry is FLAKY on the dashboard.
- **Known defects** use `test.fail()` + an issue annotation: CI stays green while the bug reproduces and turns red when it is fixed.
- **Parallel but polite:** fully parallel, 4 workers locally, 2 in CI, against someone else's production.

## Tooling used to build it
Claude Code: Playwright probe scripts and the crawler for exploration, Playwright's test MCP
server for the planner/generator/healer agents, a custom `site-explorer` agent that wrote the
feature maps, and the `kumparan-qa` skill in `.claude/`. Everything an agent produced was reviewed
and re-verified under parallel load before it was kept.

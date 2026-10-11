# Playwright Agent prompts (Task C)

Task C uses Playwright's own test agents, installed with:

```bash
npx playwright init-agents --loop=claude --project=desktop-chrome --prompts
```

That command created `.claude/agents/playwright-test-{planner,generator,healer}.md`, the
`playwright-test` MCP server in `.mcp.json`, and `tests/seed.spec.ts`. The seed was then rewritten
to start from the project fixtures, so the agents' browser inherits the ad blocker, the promo
auto-dismiss, the evidence caption and the **write guard**: an agent exploring production can never
publish a comment or a report.

The agents ran in a headless Claude Code session opened in the project folder (so the project's
agents and MCP server load), with exactly the prompts below. They are the full instructions; nothing
else was given to the agents.

```bash
claude -p "$(cat docs/agent-prompts/1-plan.txt)"     --mcp-config .mcp.json --strict-mcp-config --model sonnet ...
claude -p "$(cat docs/agent-prompts/2-generate.txt)" --mcp-config .mcp.json --strict-mcp-config --model sonnet ...
claude -p "$(cat docs/agent-prompts/3-heal.txt)"     --mcp-config .mcp.json --strict-mcp-config --model sonnet ...
```

### Running the agents yourself

The same prompts are saved as Claude Code prompt files in `.claude/prompts/`
(`playwright-test-plan.md`, `playwright-test-generate.md`, `playwright-test-heal.md`), and as plain
text in `docs/agent-prompts/`. `.mcp.json` was generated on Windows (`cmd /c npx ...`); on macOS or
Linux run `npx playwright init-agents --loop=claude` once to regenerate it for your platform.

## 1. Planner: explore and write the plan

```text
Use the playwright-test-planner agent.

Goal: a test plan for three kumparan.com features: Search, Share and Navigation, on the desktop site.

Before exploring, read the feature maps docs/features/search.md, docs/features/share.md and
docs/features/navigation.md. They describe flows already recorded by the project's crawler; use them
to explore faster, and look for behavior they do not cover.

Seed file: tests/seed.spec.ts (it opens the homepage with the project fixtures).
Save the plan to: specs/search-share-navigation.plan.md

Rules:
- Read-only on production: never submit a comment, a report, a login, or any form that publishes.
- Prefer data-qa-id locators (the config sets testIdAttribute to data-qa-id, so use getByTestId).
- Name each scenario with an ID TC-AGT-001, TC-AGT-002, ... in the scenario title.
- At most 8 scenarios: mix positive, negative and edge cases; each states its expected result.
```

## 2. Generator: turn the plan into tests

```text
Use the playwright-test-generator agent.

Generate one Playwright test per scenario in specs/search-share-navigation.plan.md.
Seed file: tests/seed.spec.ts.
Write the tests under tests/agent/<feature>/<feature>.agent.spec.ts (feature = search, share or navigation).

Rules for every generated file:
- Import { test, expect } from '../../../src/fixtures' (the project fixtures, never '@playwright/test'),
  so the ad blocker, promo handler, write guard and video caption apply.
- Test titles start with the scenario ID in brackets, e.g. "[TC-AGT-001] search returns results".
- Locators: getByTestId (data-qa-id) first; role or text only when no data-qa-id exists.
- Every test ends with assertions on the outcome (URL, visible element, text or count), never actions only.
- Never click a submit, report, comment-send, login or logout button.
```

## 3. Healer: run and fix

```text
Use the playwright-test-healer agent.

Run the tests in tests/agent/ on the desktop-chrome project and fix any failing test.
Rules:
- Fix the test, not the expectation: never delete an assertion to make a test pass.
- If a failure is a real product defect, keep the assertion and mark the test with
  test.fixme(true, '<what is wrong>') instead of weakening it, and say so in your summary.
- Keep using getByTestId (data-qa-id) locators and the project fixtures import.
```

## 4. Mobile cycle: plan, generate and heal for m.kumparan.com

The first cycle was scoped to desktop. Task C covers desktop **and** mobile, so a second cycle ran
on the `mobile-chrome` project (Pixel 7 emulation) in one session:

```text
Run the full Playwright agent cycle for the MOBILE site (m.kumparan.com), using the project "mobile-chrome".

Step 1. Use the playwright-test-planner agent.
- Seed file: tests/seed.spec.ts, run on the mobile-chrome project (it opens https://m.kumparan.com).
- First read docs/features/navigation.md, docs/features/share.md and docs/features/auth.md (mobile rows).
- Plan exactly 4 mobile-specific scenarios, IDs TC-AGT-010 to TC-AGT-013:
  burger side menu (open, items, close), top-nav strip routes (nb-* items), the mobile share bar and share modal,
  and the guest login entry from the side menu (open the login form only, never submit it).
- Save the plan to specs/mobile.plan.md.

Step 2. Use the playwright-test-generator agent.
- Generate one test per scenario into tests/agent/mobile/mobile.agent.spec.ts.
- Import { test, expect } from '../../../src/fixtures'. Test titles start with the scenario ID in brackets.
- Wrap the describe with: test.skip(({ platform }) => platform !== 'mobile', 'Generated for m.kumparan.com').
- getByTestId (data-qa-id) first; every test ends with assertions on the outcome.
- Never click submit, report, comment-send, login or logout buttons.

Step 3. Use the playwright-test-healer agent.
- Run tests/agent/mobile on the mobile-chrome project and fix failures.
- Fix the test, never weaken or delete an assertion. A real product defect: keep the assertion and mark it with
  test.fixme(true, '<what is wrong>') and say so in the summary.
```

## What the human reviewer checked afterwards

The generated plan and tests were reviewed like any pull request (see the commit history):
every test has outcome assertions, uses the project fixtures, and the TC-AGT IDs are listed in
`docs/test-cases.md`. Changes made during review are listed in `tests/agent/REVIEW.md`.

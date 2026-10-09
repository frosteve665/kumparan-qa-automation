---
name: kumparan-qa
description: Knowledge and workflow for testing kumparan.com and m.kumparan.com in this repo. Use when writing or fixing a test, exploring a kumparan feature, triaging a failure, or filing a finding. Covers where the site knowledge lives (flow map, feature maps), locator rules, production safety rules, timing helpers, and the explore -> design -> automate -> verify loop.
---

# kumparan QA

## 1. Read the knowledge before touching the site
| Need | Read |
|---|---|
| What a feature does, entry points, expected results, gotchas | `docs/features/<feature>.md` |
| What every `data-qa-id` does when clicked (desktop and mobile) | `knowledge/flow-digest.md`, then `knowledge/flow-map.json` |
| What changed since the last crawl | `knowledge/drift.md` |
| Existing cases and IDs | `test-design/catalog.ts` (or grep `[TC-` in `tests/`) |
| Known defects (do not re-report) | `docs/bugs/BUG-*.md`, `docs/findings.md` |

If the knowledge is stale or missing, re-crawl instead of guessing:
`npm run explore -- --only=<page> --platform=<desktop|mobile>` then `npm run explore:digest`.

## 2. Safety rules (production)
- Never click: `btn-send-comment`, report submit (`btn-report` inside the report form), `btn-save` on /login, logout, social login.
- The write guard aborts comment/report mutations and fails the test: never route around it.
- Login is behind Cloudflare Turnstile: never automate it. Logged-in flows are out of scope.

## 3. Writing a test
- Import `{ test, expect }` from `src/fixtures` (web) or `src/fixtures/api` (GraphQL). Never from `@playwright/test` directly in specs.
- Use page objects (`home`, `article`, `comments`, `report`, `search`, `header`); add members there, not raw locators in specs.
- Locators: `getByTestId` -> role/name -> documented anchor.
- Platform differences belong in the page object (`this.isMobile`), not in the spec.
- Timing: `waitForInteractive(locator)` before interacting with freshly rendered controls; `clickUntilUrl`/`clickUntilVisible` for navigation-like clicks. No fixed sleeps.
- Every test ends with outcome assertions. Title: `[TC-XXX-NNN] <behavior>`; tags for feature, priority and kind.

## 4. Triage a failure
1. Open `reports/index.html` -> the run -> the row: watch the video (the caption shows the step), open the trace.
2. Classify: environment (network/bot block), script error (our locator/timing), bug (outcome wrong).
3. Script error: fix the shared page object (a missing wait), never a browser- or platform-specific hack in the spec.
4. Bug: reproduce by hand, write `docs/bugs/BUG-NNN.md`, mark the test `test.fail()` with an `issue` annotation.

## 5. Verify before calling it done
Run the spec on desktop-chrome and mobile-chrome, then `--repeat-each=3 --workers=4`. Update the catalog and run `npm run docs:test-cases`.

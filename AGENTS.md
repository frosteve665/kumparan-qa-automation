# AGENTS.md

Guide for anyone (human or AI agent) changing this repository: Playwright + TypeScript QA
automation for kumparan.com (desktop), m.kumparan.com (mobile) and a GraphQL API.

## Ground rules (production site)
1. **Never submit a comment or a report.** Assert up to the submit button. The fixture write guard
   aborts such requests and fails the test; do not weaken or bypass it.
2. **Never automate past the Cloudflare check on login.** Logged-in flows need a human and are out of scope.
3. **Never put credentials in code, prompts or logs.**
4. Be polite to production: keep workers low, no request loops, no load tests.

## Layout
| Path | What |
|---|---|
| `src/pages/` | Platform-aware page objects (desktop and mobile behind one interface) |
| `src/fixtures/` | Auto fixtures: network (ad block, write guard, share stubs), interruptions, caption; page objects; API client |
| `src/support/` | Network rules, promo handler, caption, test data resolution, assertions |
| `src/api/` | Typed GraphQL client, operations (variables only), zod contracts |
| `src/reporters/` | Evidence dashboard and failure classifier |
| `tests/web/` | Hand-written specs (Task B) |
| `tests/agent/` | Playwright-agent-generated specs (Task C), reviewed in `tests/agent/REVIEW.md` |
| `tests/api/` | GraphQL specs (Task D) |
| `test-design/catalog.ts` | Test case catalog: source of `docs/test-cases.md` and `.xlsx` |
| `scripts/explorer/` | Site crawler (flow map) and digest |
| `knowledge/` | Crawler output: flow map, digest, drift report, screenshots |
| `docs/` | Test plan, test cases, feature maps, findings, bug reports, strategy, agent prompts |

## Conventions
- **One test case per file**, named by its ID and a short title: `tests/web/<feature>/TC-<MODULE>-<NNN>_<Short_Title>.spec.ts`.
  The test title is `[TC-<MODULE>-<NNN>] <readable description>`, held in a `CASE` constant.
- **Tests read as steps:** a test calls page-object actions and `verify…` methods only. Locators, waits and
  platform differences live in the page object. Journeys used by several tests live in `src/flows/`.
- **Test data** comes from `src/data/*.data.ts`, never literals in a test.
  Every automated case also appears in `test-design/catalog.ts`; run `npm run docs:test-cases` after changing either.
- **Tags:** priority (`@p1`...`@p3`), `@smoke`, `@defect`, and `@desktop-only` / `@mobile-only` for platform-specific
  cases (those are not scheduled on the other platform, so runs report no skips).
- **Locators:** `getByTestId` (data-qa-id) first; role/name next; any other anchor is documented in the page object with the reason.
- **Waiting:** web-first assertions, `waitForInteractive`, `clickUntilUrl`/`clickUntilVisible`. No `waitForTimeout` in specs.
- **Known defects:** `test.fail()` plus an `issue` annotation `BUG-NNN: ...`, and a report in `docs/bugs/`.
  Intermittent defects use `test.fixme()` with the measured rate (they must not be gates).
- **Files:** `<screen>.page.ts`, `<feature>.data.ts`, `<journey>.flow.ts`; classes PascalCase. Formatting: Prettier (`npm run format`).

## Definition of done
A change is done when a reviewer does not have to redo any of it:
1. `npm run typecheck` is green.
2. The affected specs pass on **both** `desktop-chrome` and `mobile-chrome`, and a new test also passes with
   `--repeat-each=3 --workers=4` (flakiness shows up under load, not in a single run).
3. New or changed cases are in `test-design/catalog.ts`; `npm run docs:test-cases` has been run.
4. A new product finding has a bug report in `docs/bugs/` with steps, expected/actual and evidence, reproduced at least once by hand.
5. When the UI changed, `npm run explore && npm run explore:digest` has been run and `knowledge/drift.md` reviewed.
If something could not be verified, say so explicitly; never imply it was.

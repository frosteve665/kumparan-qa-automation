# kumparan QA Engineer Skill Test: Playwright + TypeScript

[![QA automation](https://github.com/frosteve665/kumparan-qa-automation/actions/workflows/e2e.yml/badge.svg)](https://github.com/frosteve665/kumparan-qa-automation/actions/workflows/e2e.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Sites](https://img.shields.io/badge/tested-kumparan.com%20%C2%B7%20m.kumparan.com%20%C2%B7%20GraphQL-555)

Risk-based test design, Playwright automation for the **desktop and mobile** kumparan sites,
tests generated with **Playwright Agents**, and **GraphQL** API tests. All four tasks of the brief,
in one repository.

## Results at a glance

| | |
|---|---|
| **Test cases designed** | **85**, prioritised P1–P3 ([test-cases.md](docs/test-cases.md) · [Excel](docs/test-cases.xlsx)) |
| **Automated** | All 85: 53 website cases (Task B), 13 agent-generated (Task C), 19 GraphQL (Task D) |
| **Latest full run** | **169 runs · 162 passed · 7 known defects reproduced · 0 failed · 0 flaky · 0 skipped** (3.4 min) |
| **Defects found** | **6**, each with steps, expected vs actual and video/screenshot/JSON evidence ([docs/bugs](docs/bugs)) |
| **Re-verified** | Every defect re-tested in Google Chrome without ad blocking or test tooling |

## Review in 10 minutes

1. **[Test plan](docs/test-plan.md):** scope, risks, assumptions, out of scope, dependencies, test data, exit criteria.
2. **[Test cases](docs/test-cases.md):** every case with priority, type, steps and latest result.
3. **[Findings](docs/findings.md):** execution summary, the 6 defects, observations, exit criteria check.
4. **Two test files:** [TC-LIKE-004](tests/web/like/TC-LIKE-004_Guest_Like_Redirects_To_Login.spec.ts) and [TC-RPT-002](tests/web/report/TC-RPT-002_Each_Reason_Enables_Submit.spec.ts) show the style: one test case per file, steps only, the same file runs on both sites.
5. **[Agent prompts](docs/agent-prompts.md)** and the **[review of the agent's code](tests/agent/REVIEW.md)**.
6. **One API test file:** [negative.spec.ts](tests/api/graphql/negative.spec.ts).

## How each requirement is met

### Scenario rules
| Rule in the brief | How it is covered |
|---|---|
| Active accounts can log in and log out; invalid accounts are rejected with a clear message | Login entry, form and validation messages are automated: empty form blocked, malformed email shows *"Harus diisi dengan format email"*, empty password shows *"Tidak boleh kosong"* (TC-AUTH-001 to 007). **A real sign-in and logout are out of scope:** kumparan protects login with Cloudflare's "Verify you are human" check, which needs a person and must not be bypassed. The check itself is asserted (TC-AUTH-005). Details and a recommendation in the [test plan](docs/test-plan.md#out-of-scope). |
| View, share, like, comment and report; never submit comments or reports | View (TC-ART), share (TC-SHR: WhatsApp, Facebook, X, LINE, copy link), like (TC-LIKE), comment (TC-CMT), report (TC-RPT). Comment and report are checked up to the submit button only. A **network guard** also blocks any comment or report request and fails the test, so a submission is impossible even by mistake. |
| Core functions must work on desktop and mobile, even with different layouts | Every website test runs on **kumparan.com (desktop)** and **m.kumparan.com (Pixel 7)**; smoke tests also run on **iPhone 15 (Safari engine)**. Page objects hide the layout differences (header button vs burger menu, inline share icons vs share pop-up). |

### Task A: test cases and risk analysis
| Requirement | Where |
|---|---|
| Test cases for desktop and mobile, with priority | [test-cases.md](docs/test-cases.md): 85 cases, P1 (core function) to P3 (cosmetic), each with the risk it covers |
| Happy paths, negative, boundaries | Every module mixes Positive / Negative / Boundary / Edge cases (summary table at the top of test-cases.md) |
| Exploratory | 5 exploratory charters in the [test plan](docs/test-plan.md), plus a crawler that clicked **183** buttons and links on both sites and recorded where each one leads ([flow digest](knowledge/flow-digest.md), [feature maps](docs/features)) |
| Authorization | Guest vs signed-in rules: a guest who taps like is sent to login and nothing is counted (TC-LIKE-004); a guest typing a comment publishes nothing (TC-CMT-004); a guest reaching the report form (TC-RPT-007) |
| Error handling | Missing story returns 404 with navigation intact (TC-ART-004); missing story in the report form (TC-RPT-008); invalid route (TC-AGT-008); API errors (TC-API-012 to 015) |
| State changes | Report reason selection and submit enabling (TC-RPT-002/003/010/011), dark mode surviving a reload (TC-NAV-003), search sort (TC-SRCH-003), side menu open/close (TC-NAV-002) |
| Data validation | Counters are numbers and match between article and comments (TC-ART-002, TC-CMT-002), share links carry the right story (TC-SHR-001/004/005), search input encoding and HTML escaping (TC-SRCH-008 to 010), API response contracts (zod) |
| Assumptions, out of scope, dependencies, data needs, exit criteria | [test-plan.md](docs/test-plan.md), sections 1–9 |
| Execute and report findings | [findings.md](docs/findings.md) and [6 bug reports](docs/bugs) |

### Task B: Playwright website tests
| Requirement | Where |
|---|---|
| Automate the Task A cases for desktop and mobile | [tests/web/](tests/web): 53 cases, **one file per test case** named by its ID (e.g. `TC-RPT-003_Submit_Disabled_Without_Reason.spec.ts`); each test reads as its steps |
| Fixtures or setup to isolate data and state | [src/fixtures](src/fixtures/index.ts): fresh browser per test, page objects injected, a live story resolved per worker, automatic network guard, ad blocking and pop-up handling |
| Strategy for parallel execution, data cleanup, timeouts, retries, flaky tests | [automation-strategy.md](docs/automation-strategy.md) |
| `data-qa-id` locators; creative when missing | `testIdAttribute: 'data-qa-id'` in the config. Where no `data-qa-id` exists, a stable alternative is documented in the page object (for example the comment box `textarea#comment-editor`, the password toggle found next to the password field) |

### Task C: Playwright Agent
| Requirement | Where |
|---|---|
| Automate the Task A cases with Playwright Agent, desktop and mobile | [tests/agent/](tests/agent): 13 tests from Playwright's **planner → generator → healer** agents. They automate **21 Task A cases** ([traceability table](docs/test-cases.md#task-c-traceability-task-a-cases-automated-by-playwright-agent)) |
| Agent explores the site and helps generate the cases | Plans written by the planner after exploring the live site: [specs/](specs) |
| Prompts used | [docs/agent-prompts.md](docs/agent-prompts.md) (also as plain files in [docs/agent-prompts/](docs/agent-prompts)) |
| `data-qa-id` preferred, stable fallbacks | Required in every prompt; checked in review |
| Proper assertions, not only actions | Every test ends with outcome checks; reviewed and stress-tested ([REVIEW.md](tests/agent/REVIEW.md)). The healer agent also found a real accessibility defect (BUG-006). |
| Easy to run and maintain | Same fixtures and page objects as Task B; run with `npm run test:agent`; conventions in [AGENTS.md](AGENTS.md) |

### Task D: Playwright API (GraphQL)
| Requirement | Where |
|---|---|
| At least 5 queries | **7** queries in [queries.spec.ts](tests/api/graphql/queries.spec.ts) (GraphQLZero) |
| Playwright's `request` / APIRequestContext | [graphql-client.ts](src/api/graphql-client.ts) wraps Playwright's `request` fixture |
| Queries and negative tests | 8 negative, boundary and security tests in [negative.spec.ts](tests/api/graphql/negative.spec.ts) |
| Authorization and mutations (only if the endpoint has authentication) | GraphQLZero has no authentication, so authorization does not apply. Mutations are covered anyway: create, update, delete and a rejected create in [mutations.spec.ts](tests/api/graphql/mutations.spec.ts) |
| Inputs as GraphQL variables, no string concatenation | Every operation is a constant in [operations.ts](src/api/operations.ts); inputs are always variables. TC-API-016 proves an injection-shaped value stays plain data |
| Validate HTTP status, `data` and `errors` | Every test asserts all three; response shapes are checked with zod contracts |
| Clear tests | One behaviour per test, named `[TC-API-NNN] <what it proves>` |

## Defects found

| ID | What happens | Where | Severity |
|---|---|---|---|
| [BUG-001](docs/bugs/BUG-001.md) | "Batal" on the report form does nothing when the report link was opened in a new tab; readers arriving from another site are sent back there | Desktop, mobile | Medium |
| [BUG-002](docs/bugs/BUG-002.md) | Opening the report form with the keyboard leaves the article URL in the address bar while the form is shown | Desktop | Low |
| [BUG-003](docs/bugs/BUG-003.md) | React hydration error (#418) on every desktop homepage load; the page responds to clicks late | Desktop | Medium |
| [BUG-004](docs/bugs/BUG-004.md) | API: a post that does not exist comes back as an empty post instead of `null` | GraphQL | Medium |
| [BUG-005](docs/bugs/BUG-005.md) | API: negative page limits are accepted (-5 returns 95 rows); 0 silently becomes 10 | GraphQL | Medium |
| [BUG-006](docs/bugs/BUG-006.md) | Share pop-up ignores Escape and is not announced as a dialog; a keyboard user needs 24 Tab presses to close it | Desktop, mobile | Medium (accessibility) |

Each known defect also has an automated check marked as expected-to-fail: the run stays green while
the bug exists, and turns red the day it is fixed, so the check can be removed.

## Run it yourself

No account or credentials are needed.

```bash
npm ci
npx playwright install chromium webkit

npm test                 # everything (about 4 minutes)
npm run test:desktop     # kumparan.com
npm run test:mobile      # m.kumparan.com + iPhone smoke tests
npm run test:api         # GraphQL only (about 5 seconds)
npm run test:agent       # Playwright-agent tests
```

Then open **`reports/index.html`**: every test has a video with a caption showing the test ID,
platform and current step, plus a result table per platform. `npm run report` opens Playwright's
own HTML report.

**About CI.** kumparan's firewall blocks GitHub's servers ("Sorry, you don't have permission to
access this website"). In GitHub Actions the API tests run fully and the website tests are skipped
with that reason instead of failing misleadingly. Run the website tests locally, as above, or on a
self-hosted runner.

## How the framework works

The framework is built in layers. A test only says **what** a reader does; the layers underneath
handle **how**: locators, waiting, desktop vs mobile, safety and evidence.

```
tests/web/<feature>/TC-XXX-NNN_*.spec.ts   WHAT: the test case steps
        | uses
src/flows/                                 multi-step journeys (e.g. a report link opened in a new tab)
src/pages/                                 HOW: locators, actions, verify... methods, desktop vs mobile
src/data/                                  test data (emails, search terms, report reasons)
        | runs inside
src/fixtures/                              SETUP: fresh browser, safety guard, ads, pop-ups, caption
        | configured by
playwright.config.ts                       WHERE: desktop / mobile / iPhone / API projects
        | results go to
src/reporters/  ->  reports/index.html     EVIDENCE: result per platform, video per test
```

### A test case is just its steps

Every website test case has its own file, named by its ID
(`tests/web/like/TC-LIKE-004_Guest_Like_Redirects_To_Login.spec.ts`):

```ts
const CASE = '[TC-LIKE-004] Guest who taps like is sent to login and the count does not change';

test(CASE, { tag: ['@p1'] }, async ({ article, articlePath, login }) => {
  await article.open(articlePath);
  const likesBefore = await article.likeCount();

  await article.tapLikeAsGuest();
  await login.verifyShown();

  await article.open(articlePath);
  await article.verifyLikeCount(likesBefore);
});
```

### What happens when a test runs

1. **Playwright picks the projects.** The same file runs on **desktop-chrome** (kumparan.com) and
   **mobile-chrome** (m.kumparan.com); `@smoke` tests also run on **mobile-safari** (iPhone 15).
2. **The setup in `src/fixtures/` runs automatically** before the test body:
   - a **fresh browser** with no cookies or history (isolation);
   - a **site check**: if kumparan blocks the network (as in GitHub CI), the test is skipped with that reason;
   - the **write guard**: any comment or report submission request is blocked and fails the test;
   - **ad blocking**, and local stand-ins for the WhatsApp/Facebook/X/LINE share pop-ups;
   - a **pop-up handler** that closes the "Video Story" promo whenever it appears;
   - the **video caption** (test ID, platform, current step);
   - a **live story** picked from the homepage once per worker, so no test depends on an old URL.
3. **The test body runs its steps** through page objects.
4. **The page object does the hard work** (`src/pages/`): it finds elements by `data-qa-id`, waits
   until kumparan's JavaScript has actually wired a control before using it (`waitForInteractive`),
   and handles the desktop vs mobile difference internally.
5. **After the test**, the setup checks the write guard; video and a screenshot are kept for every
   test, a trace for failures.
6. **The reporter** labels the result PASS, FLAKY, DEFECT, FAIL or SKIPPED and adds it to
   `reports/index.html`.

### One test, two different sites

kumparan.com and m.kumparan.com are separate front-ends. Each page object knows its platform:

```ts
readonly loginEntry = this.isMobile ? this.qa('anchor-login-wrapper') : this.qa('hd-login');
```

So `header.goToLogin()` clicks the header button on desktop and opens the burger menu first on
mobile, while the test stays the same. Tests that exist on one platform only are tagged
`@desktop-only` or `@mobile-only` and are not scheduled on the other platform.

### Known bugs live inside the suite

A bug's test is marked `test.fail()` with its bug ID. While the bug exists, the test "fails as
expected": the run stays green and the dashboard shows **DEFECT**. When kumparan fixes it, the test
passes unexpectedly and turns red, the signal to remove the marker.

### The other parts

| Part | How it works |
|---|---|
| **GraphQL (Task D)** | [graphql-client.ts](src/api/graphql-client.ts) wraps Playwright's `request`. Queries are constants in [operations.ts](src/api/operations.ts); inputs are always variables. Each test checks status, `data` and `errors`; zod checks the response shape. |
| **Playwright agents (Task C)** | The planner explores the site and writes a plan ([specs/](specs)), the generator writes tests ([tests/agent/](tests/agent)), the healer runs and fixes them. They start from [tests/seed.spec.ts](tests/seed.spec.ts), so they inherit the same write guard. |
| **Site crawler** | `npm run explore` clicks every `data-qa-id` on both sites and records where it leads ([knowledge/](knowledge)). Re-running it after a UI change shows exactly what changed. |
| **Test case documents** | [test-design/catalog.ts](test-design/catalog.ts) is the single source; `npm run docs:test-cases` generates [test-cases.md](docs/test-cases.md) and the Excel file with the latest results. |
| **Bug re-check scripts** | [scripts/repro/](scripts/repro) re-test each bug in real Chrome without any of the test setup. |

### Adding a test case

1. Add the case to `test-design/catalog.ts`.
2. Create `tests/web/<feature>/TC-XXX-NNN_Short_Title.spec.ts` with the steps.
3. If a step is missing, add a method to the page object (`src/pages/`).
4. Run it on both sites: `npx playwright test -g "TC-XXX-NNN"`.
5. Update the documents: `npm run docs:test-cases`.

### Folder map

```
src/pages/        page objects: locators at the top, then actions and verify... methods
src/flows/        multi-step journeys reused by tests
src/data/         test data per feature (no literal values in tests)
src/fixtures/     test setup: isolation, write guard, ad blocking, pop-ups, video caption
src/api/          GraphQL client (variables only) and response contracts
src/reporters/    evidence dashboard (results per platform, video per test)
tests/web/        Task B: one file per test case
tests/agent/      Task C: Playwright-agent tests + review notes
tests/api/        Task D: GraphQL tests
test-design/      test case catalog that generates docs/test-cases.md and .xlsx
scripts/          site crawler, bug re-check scripts, docs and CI helpers
docs/             test plan, test cases, findings, bug reports, strategy, agent prompts
```

Key decisions (full explanation in [automation-strategy.md](docs/automation-strategy.md)):
- **Stable without fixed waits:** tests wait until controls are actually interactive, and retry a click only until its effect appears.
- **Retries are never hidden:** a test that passes on retry is reported as flaky.
- **Polite to production:** limited parallel workers, ads and share pop-ups handled locally, nothing published.
- **Easy to maintain:** one test case per file, one page object per screen, Prettier formatting (`npm run format`), and `npm run explore` to re-map the site after a UI change.

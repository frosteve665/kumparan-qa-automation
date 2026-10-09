# Test plan: kumparan.com (desktop and mobile web) and GraphQL API

Structure follows ISO/IEC/IEEE 29119-3 (test plan). Case-level detail lives in
[test-cases.md](test-cases.md) / [test-cases.xlsx](test-cases.xlsx); results in
[findings.md](findings.md) and the evidence dashboard (`reports/index.html`).

## 1. Scope

### In scope
| Area | Desktop (kumparan.com) | Mobile (m.kumparan.com) |
|---|---|---|
| Home feed | Headlines, story cards, ads-on usability | Same, plus top-nav strip |
| Authentication | Login form validation, bot challenge, valid/invalid login, session, logout | Same; entry via burger menu |
| Article view | Content, byline, metadata, 404 handling, breadcrumb | Same |
| Like | Guest redirect, signed-in like/unlike, persistence | Same |
| Comment | Thread, counters, guest and signed-in drafting (never submitted) | Same |
| Report | Form, reasons, validation, cancel paths (never submitted) | Same |
| Share | WhatsApp, Facebook, X, LINE, copy link, share menu | Same, plus Instagram icon |
| Search | Keyword, tabs, sort, empty/long/unicode/HTML input | Same; dedicated /search page |
| Navigation & preferences | Channel menu, Trending, dark mode, JS errors | Side menu, top-nav strip |
| GraphQL API (Task D) | GraphQLZero: queries, mutations, negative, security | n/a |

### Out of scope
- **Submitting comments and reports** (assignment rule): asserted up to the submit button only, and enforced by a network-level write guard.
- **Social login (Facebook/Google/phone OTP)**: third-party identity providers; presence is verified, the flows are not.
- **Registration and password recovery flows**: links verified; the flows would create accounts or send email.
- **kumparanPLUS payments, video/audio playback quality, ads correctness**: not core to the assignment's business functions.
- **Native mobile apps**: "mobile site" means m.kumparan.com in mobile browsers (device emulation of Pixel 7 and iPhone 15).
- **Load/performance and full accessibility audits**: one smoke-level quality check (JS errors) only.
- **Authorization tests on the API**: GraphQLZero has no authentication (allowed by the brief).

## 2. Approach: risk-based

Each case records the risk it mitigates. Priority is derived from impact on a core business
function x likelihood:

| Priority | Meaning | Examples |
|---|---|---|
| P1 | Blocks a core business function or a rule in the brief | Login, guest like/comment authorization, report form, story view, share link |
| P2 | Degrades a core function or data quality | Counters, tabs, sorting, cancel paths, API validation |
| P3 | Cosmetic, rare, or convenience | Theme, breadcrumb, unicode queries |

Coverage per module deliberately mixes **Positive, Negative, Boundary and Edge** cases (see the
summary table in test-cases.md), plus authorization (guest vs signed-in), error handling (404,
missing story, API errors), state changes (like/unlike, theme, sort, login/logout) and data
validation (counters, encoding, contracts).

**Exploration first.** A deterministic crawler (`npm run explore`) clicked every `data-qa-id`
element on each page type on both platforms and recorded where it lands, whether login is required
and which GraphQL operations fire (`knowledge/flow-map.json`, 183 actions). An explorer agent turned
that into feature maps (`docs/features/`). Cases are grounded in recorded behavior, not assumptions.

**Exploratory charters** (executed, findings in findings.md):
1. Guest engagement boundaries: what can a guest reach and fill without logging in?
2. Report form state machine: reasons, "Lainnya", cancel from story vs direct link.
3. Search input robustness: empty, 1 char, 200 chars, emoji, `&`, HTML.
4. Timing and hydration: interact before the page is interactive (slow devices/networks).
5. URL integrity: does the address bar always describe what is on screen?

## 3. Test items and levels
- **System / end-to-end UI** on the production sites, through Playwright (desktop Chrome, Pixel 7 Chrome, iPhone 15 WebKit for smoke).
- **API** tests against GraphQLZero through Playwright's `request` fixture.
- **Agent-generated UI tests** (Task C) through Playwright's planner/generator/healer.

## 4. Assumptions
- Production is the only available environment; there is no staging or test data API.
- Story content changes constantly, so tests resolve a live story from the homepage each run and assert structure/behavior, not specific headlines.
- Bahasa Indonesia UI copy ("Masuk", "Laporkan Konten", ...) is stable enough to assert where no `data-qa-id` exists.
- One test account is available. Its likes are reverted after each signed-in test.
- GraphQLZero is a fake backend: mutations respond as if successful but do not persist.

## 5. Dependencies and constraints
| Dependency | Impact | Mitigation |
|---|---|---|
| Cloudflare Turnstile on /login | Login cannot run unattended (and must not be bypassed) | Human ticks once per session (`npm run auth:capture`); session reused via storageState. **Recommendation:** Cloudflare test sitekey on a staging host removes this step. |
| Bot protection blocks headless user agents (403) | Default headless Chromium is rejected | Real device profiles/user agents; capped workers (2 in CI) |
| Third-party ads and a promo modal | Layout shift, intercepted clicks, flakiness | Ad hosts blocked (one ads-on smoke test keeps it honest); promo auto-dismissed via `page.addLocatorHandler` |
| Late JavaScript wiring (hydration, see BUG-003) | Early clicks ignored | `waitForInteractive` (React handlers attached) and retry-until-effect helpers, never fixed sleeps |
| Live content | Data changes between runs | Fresh story per worker; structural assertions |

## 6. Test data
| Data | Source | Notes |
|---|---|---|
| Valid account | `.env` (local) / GitHub Secrets (CI) | Never committed or given to an AI agent |
| Invalid emails | `src/data/auth.data.ts` | Equivalence classes: no @, no domain, no local part, double @ |
| Search inputs | `src/data/search.data.ts` | keyword, nonsense, 1 char, 200 chars, emoji, `&`, HTML probe |
| Story under test | Resolved from the live homepage | Fallback to a known story if parsing fails |
| GraphQL inputs | Variables in each spec | Never concatenated into documents |

## 7. Environments
| Project | Browser / device | Base URL | Runs |
|---|---|---|---|
| desktop-chrome | Chromium 1440x900 | https://kumparan.com | all web specs |
| mobile-chrome | Pixel 7 emulation | https://m.kumparan.com | all web specs |
| mobile-safari | iPhone 15 (WebKit) | https://m.kumparan.com | `@smoke` only (cross-engine check) |
| api-graphql | none | https://graphqlzero.almansi.me/api | API specs |

## 8. Entry criteria
- Sites reachable (homepage 200 with a real browser user agent).
- `npm ci` and Playwright browsers installed; `npm run typecheck` green.
- For signed-in cases: a valid captured session in `.auth/user.json`.

## 9. Exit criteria
- 100% of P1 cases executed on desktop and mobile; 100% of P1 automated cases pass, or fail only as a documented known defect.
- At least 95% of all executed automated cases pass (known defects excluded) with no unexplained FAIL.
- Every FLAKY result has a recorded cause; no test is retried into a pass without being reported as FLAKY.
- Every defect is reproduced manually at least once and written up with steps, expected/actual and evidence (docs/bugs).
- Evidence (video, screenshot, trace on failure) exists for every execution of the final run.

## 10. Deliverables
| Deliverable | Location |
|---|---|
| Test plan | docs/test-plan.md (this file) |
| Test cases | docs/test-cases.md, docs/test-cases.xlsx |
| Feature maps (exploration) | docs/features/, knowledge/flow-digest.md |
| Findings and bug reports | docs/findings.md, docs/bugs/ |
| Automation strategy | docs/automation-strategy.md |
| Agent prompts (Task C) | docs/agent-prompts.md |
| Evidence dashboard | reports/index.html (generated per run; CI artifact) |

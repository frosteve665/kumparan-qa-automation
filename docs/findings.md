# Findings and execution report

Test plan: [test-plan.md](test-plan.md) · Cases and per-case status: [test-cases.md](test-cases.md) ·
Evidence: `reports/index.html` (each execution has a video).

## Execution summary (final regression, run 2026-10-09-17-19-23)

| Project | PASS | DEFECT (known, reproduced) | FLAKY | FAIL | SKIPPED |
|---|---|---|---|---|---|
| desktop-chrome (kumparan.com) | 70 | 3 | 0 | 0 | 7 |
| mobile-chrome (m.kumparan.com, Pixel 7) | 67 | 1 | 1 | 0 | 11 |
| mobile-safari (iPhone 15 WebKit, `@smoke`) | 7 | 0 | 0 | 0 | 0 |
| api-graphql (GraphQLZero) | 17 | 2 | 0 | 0 | 0 |
| **Total: 186 executions** | **161** | **6** | **1** | **0** | **18** |

- **No FAIL:** no environment or script errors in the final run.
- **DEFECT** rows are known product defects asserted with `test.fail()`: each one still reproduces (BUG-001 twice, BUG-003, BUG-004, BUG-005, BUG-006).
- **FLAKY (1):** TC-ART-004 on mobile received HTTP **505** instead of 404 on its first attempt and passed on retry. 18 follow-up requests all returned 404, so this is recorded as an observation (OBS-003), not a defect.
- **SKIPPED (18)** by design: tests for the other platform only (desktop-only or mobile-only features and agent cycles), the Chromium-only clipboard check on WebKit, and BUG-002's intermittent reproduction (`test.fixme`).

Manual and human-assisted executions (Cloudflare-gated login, TC-AUTH-008/009) are logged in
`test-design/manual-results.ts` and shown in test-cases.md.

## Defects

| ID | Title | Platforms | Severity | Found by |
|---|---|---|---|---|
| [BUG-001](bugs/BUG-001.md) | "Batal" on a directly opened report link leaves kumparan for `about:blank` | Desktop, mobile | Medium | Site crawler, then test |
| [BUG-002](bugs/BUG-002.md) | Address bar switches back to the story while the report form is shown | Desktop 2/6, mobile 3/7 (intermittent) | Low | Exploratory charter "URL integrity" |
| [BUG-003](bugs/BUG-003.md) | React hydration mismatch (#418) on the desktop homepage; late interactivity | Desktop | Medium | TC-NAV-005 (quality check) |
| [BUG-004](bugs/BUG-004.md) | API: unknown post id returns a ghost object instead of `null` | GraphQL | Medium | Boundary case TC-API-018 |
| [BUG-005](bugs/BUG-005.md) | API: `limit: -5` accepted, returns 95 rows | GraphQL | Medium | Boundary case TC-API-019 |
| [BUG-006](bugs/BUG-006.md) | Share modal is not an accessible dialog: Escape ignored, no `role="dialog"`, focus not moved | Desktop, mobile | Medium (a11y) | Playwright healer agent, confirmed by hand |

## Observations (not filed as defects)

| ID | Observation | Why it is not a defect (yet) |
|---|---|---|
| OBS-001 | A guest can type a whole comment with no login prompt; nothing is sent while typing | The brief does not define guest drafting behavior, and what "send" does for a guest cannot be checked without sending (forbidden). UX risk: a guest may lose a written comment at login. |
| OBS-002 | A search submitted right after page load lands on `/?desktop-search=<term>` (homepage, no results) | A consequence of BUG-003 (the plain HTML form submits before JavaScript takes over); fixed together with it. |
| OBS-003 | One HTTP 505 for an unknown story URL on mobile under parallel load | Not reproducible: 18/18 follow-up requests returned 404. Worth watching in server logs. |
| OBS-004 | A guest can open the report form and enable "Laporkan" (TC-RPT-007) | Whether the server then requires login cannot be verified without submitting. Recorded as an authorization question for the team. |
| OBS-005 | Report reasons are named "radio" but built as `<input type="checkbox">`; single choice is enforced by script | Works (TC-RPT-005 passes), but screen readers announce checkboxes; related to BUG-006's accessibility theme. |
| OBS-006 | A guest tapping Like fires a `CreateLike` request before redirecting to login | The count does not change (TC-LIKE-004 passes), so the server rejects it; the client could skip a request it knows will fail. |

## Business rules from the brief: status

| Rule | Evidence | Status |
|---|---|---|
| Active accounts can log in and log out | TC-AUTH-008 (human-assisted), TC-AUTH-010..012 (signed-in session) | See test-cases.md: requires the Cloudflare session capture |
| Invalid accounts rejected with a clear message | TC-AUTH-002..005 automated (client-side); TC-AUTH-009 server-side (human-assisted) | Client-side validation messages are clear ("Harus diisi dengan format email", "Tidak boleh kosong") |
| Users can view, share, like, comment, report (comment/report not submitted) | ART, SHR, LIKE, CMT, RPT modules; write guard enforced | Pass, with BUG-001, BUG-002, BUG-006 |
| Core functions usable on desktop and mobile | Every web spec runs on both front-ends; smoke on WebKit | Pass (parity confirmed; differences only in layout) |

## Exit criteria assessment

| Criterion (test-plan.md section 9) | Result |
|---|---|
| 100% of P1 cases executed on desktop and mobile | Met for all guest P1 cases; signed-in P1 cases depend on the human session capture |
| 100% of P1 automated cases pass or fail only as a documented known defect | Met |
| At least 95% of executed automated cases pass (known defects excluded) | Met: 161 + 1 flaky of 162 non-defect executions (99.4%) |
| Every FLAKY result has a recorded cause | Met (OBS-003) |
| Every defect reproduced manually and written up with evidence | Met (docs/bugs, 6 reports with video/screenshots/JSON) |
| Evidence for every execution of the final run | Met (video + final screenshot for every web test) |

## Risks and recommendations
1. **Ask for a staging host with a Cloudflare Turnstile test sitekey**: it makes the login and signed-in suite fully unattended.
2. **Fix BUG-003 first**: it is the root of the late-interactivity class of issues (OBS-002, swallowed taps) that real users on slow devices feel.
3. **Treat BUG-006 as part of an accessibility pass** on modals and custom form controls (OBS-005).
4. **Add `data-qa-id`** to the few controls without one (comment textarea, password toggle, dark-mode switch, promo modal): the suite documents each fallback in its page objects.
5. **Re-run `npm run explore` per release**: `knowledge/drift.md` shows UI changes before tests break.

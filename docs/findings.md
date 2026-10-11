# Findings and execution report

Test plan: [test-plan.md](test-plan.md) · Cases and per-case status: [test-cases.md](test-cases.md) ·
Evidence: `reports/index.html` (each execution has a video).

## Execution summary (final regression, run 2026-10-11-11-02-05)

| Project | PASS | DEFECT (known, reproduced) | FLAKY | FAIL | SKIPPED |
|---|---|---|---|---|---|
| desktop-chrome (kumparan.com) | 70 | 4 | 0 | 0 | 0 |
| mobile-chrome (m.kumparan.com, Pixel 7) | 68 | 1 | 0 | 0 | 0 |
| mobile-safari (iPhone 15 WebKit, `@smoke`) | 7 | 0 | 0 | 0 | 0 |
| api-graphql (GraphQLZero) | 17 | 2 | 0 | 0 | 0 |
| **Total: 169 executions** | **162** | **7** | **0** | **0** | **0** |

- **No FAIL, no FLAKY, no SKIPPED.** Platform-specific tests are scheduled only on the platform they belong to (`@desktop-only` / `@mobile-only` tags and per-project agent folders), so nothing is skipped at run time.
- **DEFECT** rows are known product defects asserted with `test.fail()`, each still reproducing: BUG-001 (desktop and mobile), BUG-002 (desktop keyboard path, about 9 in 10 openings; the check repeats the path 3 times), BUG-003, BUG-004, BUG-005, BUG-006.
- An earlier run had one FLAKY result: TC-ART-004 on mobile received HTTP **505** instead of 404 on a first attempt; 18 follow-up requests all returned 404 (OBS-003).

Logged-in flows are out of scope: they need a person to pass Cloudflare's "Verify you are human"
check on every login (see test-plan.md, Out of scope).

## Defects

| ID | Title | Platforms | Severity | Found by |
|---|---|---|---|---|
| [BUG-001](bugs/BUG-001.md) | "Batal" only goes back in history: dead button on a report link opened in a new tab; sends readers from other sites away | Desktop, mobile | Medium | Site crawler; corrected after real-Chrome re-verification |
| [BUG-002](bugs/BUG-002.md) | Address bar switches back to the story while the report form is shown (keyboard path) | Desktop (3/3 by keyboard; 0/12 with normal scrolling) | Low | Exploratory charter "URL integrity" |
| [BUG-003](bugs/BUG-003.md) | React hydration mismatch (#418) on the desktop homepage; late interactivity | Desktop | Medium | TC-NAV-005 (quality check) |
| [BUG-004](bugs/BUG-004.md) | API: unknown post id returns a ghost object instead of `null` | GraphQL | Medium | Boundary case TC-API-018 |
| [BUG-005](bugs/BUG-005.md) | API: `limit: -5` accepted, returns 95 rows | GraphQL | Medium | Boundary case TC-API-019 |
| [BUG-006](bugs/BUG-006.md) | Share modal is not an accessible dialog: Escape ignored, no `role="dialog"`, focus not moved | Desktop, mobile | Medium (a11y) | Playwright healer agent, confirmed by hand |

## Re-verification (2026-10-11)
Every defect was re-tested in **Google Chrome with no ad blocking and none of the suite's fixtures**,
on desktop and mobile, with user-like interactions (scripts in `scripts/repro/`, raw results in
`docs/bugs/evidence/verification/`). All six are confirmed. Two reports were corrected:
- **BUG-001:** "about:blank" was an automation artifact (a Playwright tab starts at about:blank). The real impact is a dead "Batal" button on shared links and an exit from the site for readers arriving from elsewhere.
- **BUG-002:** narrowed from "intermittent" to a deterministic keyboard path (3/3); normal scrolling does not trigger it (0/12).

Real Chrome also surfaced three interruptions that the suite's ad blocking hides from tests: a
OneSignal notification prompt, a full-screen mobile ad ("TUTUP") and the "Video Story" promo. Each
blocks clicks until dismissed; real-user usability with ads on is covered by TC-HOME-003.

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
| Active accounts can log in and log out | Login entry and form (TC-AUTH-001, 006, 007); bot challenge present (TC-AUTH-005) | **Not automatable:** a successful login needs a human to pass Cloudflare Turnstile. Out of scope by agreement; recommend a staging test sitekey |
| Invalid accounts rejected with a clear message | TC-AUTH-002..005 (client-side validation) | Pass: clear messages ("Harus diisi dengan format email", "Tidak boleh kosong"); submit disabled. Server-side rejection sits behind the same human check |
| Users can view, share, like, comment, report (comment/report not submitted) | ART, SHR, LIKE, CMT, RPT modules; write guard enforced | Pass, with BUG-001, BUG-002, BUG-006 |
| Core functions usable on desktop and mobile | Every web spec runs on both front-ends; smoke on WebKit | Pass (parity confirmed; differences only in layout) |

## Exit criteria assessment

| Criterion (test-plan.md section 9) | Result |
|---|---|
| 100% of P1 cases executed on desktop and mobile | Met (logged-in flows are out of scope) |
| 100% of P1 automated cases pass or fail only as a documented known defect | Met |
| At least 95% of executed automated cases pass (known defects excluded) | Met: 162 of 162 non-defect executions (100%) |
| Every FLAKY result has a recorded cause | Met (none in the final run; the earlier one is OBS-003) |
| Every defect reproduced manually and written up with evidence | Met: all six re-verified in Google Chrome without test tooling (2026-10-11); reports in docs/bugs with video, screenshots or JSON |
| Evidence for every execution of the final run | Met (video + final screenshot for every web test) |

## Risks and recommendations
1. **Ask for a staging host with a Cloudflare Turnstile test sitekey**: it would bring the logged-in flows (login, logout, signed-in like/comment) into automated scope.
2. **Fix BUG-003 first**: it is the root of the late-interactivity class of issues (OBS-002, swallowed taps) that real users on slow devices feel.
3. **Treat BUG-006 as part of an accessibility pass** on modals and custom form controls (OBS-005).
4. **Add `data-qa-id`** to the few controls without one (comment textarea, password toggle, dark-mode switch, promo modal): the suite documents each fallback in its page objects.
5. **Re-run `npm run explore` per release**: `knowledge/drift.md` shows UI changes before tests break.

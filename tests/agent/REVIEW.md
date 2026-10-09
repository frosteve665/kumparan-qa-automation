# Review of agent-generated tests

Agent output is reviewed like a teammate's pull request. Plan:
`specs/search-share-navigation.plan.md` (desktop) and `specs/mobile.plan.md` (mobile); prompts in
`docs/agent-prompts.md`.

## Healer results before review (desktop)
- First run 5 passed / 3 failed. The healer fixed two locator problems (headline card vs title link;
  short share URL; renamed audio-story card) without removing assertions.
- It marked one product defect with `test.fixme`: the share modal ignores Escape.

## Changes made in review
| Test | Change | Why |
|---|---|---|
| all desktop agent specs | Added `@agent` and feature tags; skip on non-desktop projects | Suite selection (`--grep @agent`); the plan was scoped to kumparan.com |
| TC-AGT-005 | Skip on non-Chromium | Clipboard permissions are Chromium-only in Playwright |
| TC-AGT-006 | Removed the mid-test `test.fixme`; the Escape step moved to TC-AGT-009 | A mid-test fixme silently skipped the non-ASCII share check that followed it |
| TC-AGT-009 (new) | Escape check as a known defect (`test.fail` + BUG-006) | Defect re-verified by hand on both platforms: no Escape, no `role="dialog"`/`aria-modal`, focus not moved into the modal |
| TC-AGT-008 | Guest notification now asserts the redirect to `/login` (with the click-until-redirect helper) | The original check matched the header's always-visible "Masuk", so it could never fail |

## Verified after review
`npx playwright test tests/agent --project=desktop-chrome`: all pass; TC-AGT-009 fails as expected
(known defect) and is reported as DEFECT on the dashboard.

## Mobile cycle (m.kumparan.com)
The planner, generator and healer ran in one session on `mobile-chrome` (prompt 4 in
docs/agent-prompts.md): 4 scenarios, TC-AGT-010 to 013. The healer fixed one locator (the
"Tentang kumparan" row has no `data-qa-id`) and reported 8/8 passing with `--repeat-each=2`.

Review stress run (`--repeat-each=3 --workers=4`) exposed two load-only problems, fixed in review:
| Test | Change | Why |
|---|---|---|
| TC-AGT-010, TC-AGT-013 | First menu open uses `header.openSideMenu()` (retries until the drawer is in the viewport) | A tap before the page is interactive is swallowed (BUG-003 family); failed 1/6 under load |
| TC-AGT-011 | 20 s timeout for the client-fetched channel feed | Feed rendered after >10 s once in 6 runs under load; latency, not a defect |
| all | `@agent`, `@mobile` tags | Suite selection |

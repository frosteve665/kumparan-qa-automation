# Test cases

Generated from `test-design/catalog.ts` by `npm run docs:test-cases`. Do not edit by hand.
Execution status from run `2026-10-11-10-22-38` (reports/results.json) and the manual log (test-design/manual-results.ts).
Also available as a spreadsheet: [test-cases.xlsx](test-cases.xlsx).

**Legend.** Type: Positive / Negative / Boundary / Edge. Priority: P1 (blocks a core business function), P2 (degrades it), P3 (cosmetic or rare).
Status: PASS · FLAKY (passed after retry) · DEFECT (product defect, see docs/bugs) · FAIL (environment/script) · SKIPPED · NOT RUN · PLANNED (designed; waits on the human-captured signed-in session).

## Summary

| Module | Cases | P1 | Positive | Negative | Boundary | Edge | Automated |
|---|---|---|---|---|---|---|---|
| Home feed | 3 | 2 | 2 | 0 | 0 | 1 | 3 |
| Authentication | 7 | 3 | 2 | 3 | 1 | 1 | 7 |
| Article view | 5 | 2 | 4 | 1 | 0 | 0 | 5 |
| Like | 1 | 1 | 0 | 1 | 0 | 0 | 1 |
| Comment | 3 | 2 | 2 | 1 | 0 | 0 | 3 |
| Report | 12 | 4 | 2 | 2 | 3 | 5 | 12 |
| Share | 6 | 2 | 4 | 0 | 0 | 2 | 6 |
| Search | 10 | 2 | 3 | 1 | 3 | 3 | 10 |
| Navigation & preferences | 6 | 0 | 5 | 0 | 0 | 1 | 6 |
| Agent-generated (Task C) | 13 | 3 | 7 | 2 | 1 | 3 | 13 |
| GraphQL API (Task D) | 19 | 11 | 9 | 6 | 3 | 1 | 19 |
| **Total** | **85** | **32** | | | | | **85** |

## Home feed

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-HOME-001](#tc-home-001) | Homepage loads with header, headlines and story cards | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-HOME-002](#tc-home-002) | Opening a headline navigates to its article | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-HOME-003](#tc-home-003) | Homepage stays usable with real ads enabled | Edge | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Authentication

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-AUTH-001](#tc-auth-001) | Login entry point opens the login form | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-AUTH-002](#tc-auth-002) | Submit stays disabled while email and password are empty | Negative | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-AUTH-003](#tc-auth-003) | Malformed email is rejected with a format message (4 data rows) | Negative | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-AUTH-004](#tc-auth-004) | Clearing the password shows a required-field message | Boundary | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-AUTH-005](#tc-auth-005) | Login is protected by a bot challenge before submit | Negative | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-AUTH-006](#tc-auth-006) | Password visibility toggle reveals and hides the password | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-AUTH-007](#tc-auth-007) | Alternative sign-in methods and recovery links are offered | Positive | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Article view

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-ART-001](#tc-art-001) | Article shows title, byline, date and body | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-ART-002](#tc-art-002) | Engagement bar offers like, comment and share with numeric counters | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-ART-003](#tc-art-003) | Page title and canonical URL identify the story | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-ART-004](#tc-art-004) | Unknown story URL returns 404 and keeps site navigation | Negative | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-ART-005](#tc-art-005) | Breadcrumb Home returns to the homepage | Positive | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Like

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-LIKE-004](#tc-like-004) | Guest who taps like is sent to login and the count does not change | Negative | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Comment

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-CMT-001](#tc-cmt-001) | Comment button opens the story comment thread | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-CMT-002](#tc-cmt-002) | Comment count on the article matches the thread | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-CMT-004](#tc-cmt-004) | Guest typing a comment publishes nothing | Negative | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Report

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-RPT-001](#tc-rpt-001) | Report opens "Laporkan Konten" with six reasons | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-002](#tc-rpt-002) | Each of reasons 1-5 can be selected and enables submit (5 data rows) | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-003](#tc-rpt-003) | Submit stays disabled until a reason is chosen | Negative | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-004](#tc-rpt-004) | Cancel from the story returns to the story without reporting | Negative | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-005](#tc-rpt-005) | Only one reason can be selected at a time | Boundary | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-006](#tc-rpt-006) | "Lainnya" reveals a free-text field | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-007](#tc-rpt-007) | Guest can complete the report form up to submit | Edge | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-008](#tc-rpt-008) | Report link for a missing story is handled cleanly | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-009](#tc-rpt-009) | "Batal" on a report link opened in a new tab takes the reader out of the form (BUG-001) | Edge | P2 | Desktop, Mobile | Automated | desktop: DEFECT<br>mobile: DEFECT |
| [TC-RPT-010](#tc-rpt-010) | "Lainnya" with an empty reason cannot be submitted | Boundary | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-011](#tc-rpt-011) | "Lainnya" becomes submittable once a reason is written | Boundary | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-RPT-012](#tc-rpt-012) | Keyboard user opening the report form keeps the form URL in the address bar (BUG-002) | Edge | P3 | Desktop | Automated | desktop: DEFECT<br>mobile: SKIPPED |

## Share

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-SHR-001](#tc-shr-001) | WhatsApp share carries the headline and the story link | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SHR-002](#tc-shr-002) | Share menu lists every share channel | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SHR-003](#tc-shr-003) | Copy link puts the story link on the clipboard and confirms it | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SHR-004](#tc-shr-004) | Facebook, X and LINE shares carry the story link (3 data rows) | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SHR-005](#tc-shr-005) | Shared links are absolute https URLs on kumparan.com | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SHR-006](#tc-shr-006) | Share menu closes with its close button | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Search

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-SRCH-001](#tc-srch-001) | Keyword search from the header returns relevant stories | Positive | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS<br>mobile safari: PASS |
| [TC-SRCH-002](#tc-srch-002) | Result tabs switch the result type (5 data rows) | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-003](#tc-srch-003) | "Terbaru" sort switches to newest-first | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-004](#tc-srch-004) | Nonsense keyword shows the "not found" state | Negative | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-005](#tc-srch-005) | Submitting an empty query stays on the search landing page | Boundary | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-006](#tc-srch-006) | One-character query is accepted | Boundary | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-007](#tc-srch-007) | 200-character query is handled without error | Boundary | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-008](#tc-srch-008) | HTML typed into search is shown as text, never rendered | Edge | P1 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-009](#tc-srch-009) | Emoji and unicode queries are encoded and searched | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-SRCH-010](#tc-srch-010) | Query with "&" is encoded, not split | Edge | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |

## Navigation & preferences

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-NAV-001](#tc-nav-001) | Channel menu opens the News channel | Positive | P2 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-NAV-002](#tc-nav-002) | Mobile side menu opens and closes | Positive | P2 | Mobile | Automated | desktop: SKIPPED<br>mobile: PASS |
| [TC-NAV-003](#tc-nav-003) | Dark mode switches the theme and survives a reload | Positive | P3 | Desktop, Mobile | Automated | desktop: PASS<br>mobile: PASS |
| [TC-NAV-004](#tc-nav-004) | "Lihat lainnya" on trending opens the Trending page | Positive | P2 | Desktop | Automated | desktop: PASS<br>mobile: SKIPPED |
| [TC-NAV-005](#tc-nav-005) | Homepage loads without first-party JavaScript errors (BUG-003) | Edge | P2 | Desktop, Mobile | Automated | desktop: DEFECT<br>mobile: PASS |
| [TC-NAV-006](#tc-nav-006) | Mobile top-nav strip opens Trending | Positive | P2 | Mobile | Automated | desktop: SKIPPED<br>mobile: PASS |

## Agent-generated (Task C)

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-AGT-001](#tc-agt-001) | Search a common term and switch every result tab | Positive | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-002](#tc-agt-002) | No-result term shows the empty state | Negative | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-003](#tc-agt-003) | Boundary queries: empty, 1 char, 300 chars, special characters | Boundary | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-004](#tc-agt-004) | Sort Terbaru/Relevansi and clear the query with x-circle | Edge | P3 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-005](#tc-agt-005) | Share bar: WhatsApp popup and copy link from a headline story | Positive | P1 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-006](#tc-agt-006) | Share menu lists channels, closes, and works for a non-ASCII headline | Edge | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-007](#tc-agt-007) | Header and sub-menu routes (Trending, Breaking News, Audio Story, More) | Positive | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-008](#tc-agt-008) | Guest notification, theme persistence across pages, invalid route | Edge | P2 | Desktop | Automated (agent-generated) | desktop: PASS<br>mobile: SKIPPED |
| [TC-AGT-009](#tc-agt-009) | Share modal closes with Escape like an accessible dialog (BUG-006) | Negative | P2 | Desktop | Automated (agent-generated) | desktop: DEFECT<br>mobile: SKIPPED |
| [TC-AGT-010](#tc-agt-010) | Mobile burger side menu: open, every item and link, close (x3) | Positive | P2 | Mobile | Automated (agent-generated) | desktop: SKIPPED<br>mobile: PASS |
| [TC-AGT-011](#tc-agt-011) | Mobile top-nav strip routes | Positive | P2 | Mobile | Automated (agent-generated) | desktop: SKIPPED<br>mobile: PASS |
| [TC-AGT-012](#tc-agt-012) | Mobile share bar and share modal | Positive | P1 | Mobile | Automated (agent-generated) | desktop: SKIPPED<br>mobile: PASS |
| [TC-AGT-013](#tc-agt-013) | Mobile guest login entry from the side menu (form only, never submitted) | Positive | P1 | Mobile | Automated (agent-generated) | desktop: SKIPPED<br>mobile: PASS |

## GraphQL API (Task D)

| ID | Test case | Type | Pri | Platforms | Automation | Status |
|---|---|---|---|---|---|---|
| [TC-API-001](#tc-api-001) | post(id) returns the post with its author | Positive | P1 | API | Automated | api: PASS |
| [TC-API-002](#tc-api-002) | posts paginate with page size and total count | Positive | P1 | API | Automated | api: PASS |
| [TC-API-003](#tc-api-003) | user query resolves nested posts for that user only | Positive | P1 | API | Automated | api: PASS |
| [TC-API-004](#tc-api-004) | album returns owner and photos with valid URLs | Positive | P2 | API | Automated | api: PASS |
| [TC-API-005](#tc-api-005) | keyword search returns only matching posts | Positive | P2 | API | Automated | api: PASS |
| [TC-API-006](#tc-api-006) | posts sort by id descending | Positive | P3 | API | Automated | api: PASS |
| [TC-API-007](#tc-api-007) | last page holds the remainder | Boundary | P2 | API | Automated | api: PASS |
| [TC-API-008](#tc-api-008) | createPost returns the new post echoing the input | Positive | P1 | API | Automated | api: PASS |
| [TC-API-009](#tc-api-009) | updatePost returns the new title | Positive | P1 | API | Automated | api: PASS |
| [TC-API-010](#tc-api-010) | deletePost confirms the deletion | Positive | P1 | API | Automated | api: PASS |
| [TC-API-011](#tc-api-011) | createPost without the required title is rejected | Negative | P1 | API | Automated | api: PASS |
| [TC-API-012](#tc-api-012) | malformed document is a parse error | Negative | P1 | API | Automated | api: PASS |
| [TC-API-013](#tc-api-013) | unknown field fails schema validation | Negative | P1 | API | Automated | api: PASS |
| [TC-API-014](#tc-api-014) | missing required variable is bad input | Negative | P1 | API | Automated | api: PASS |
| [TC-API-015](#tc-api-015) | wrong variable type is bad input | Negative | P2 | API | Automated | api: PASS |
| [TC-API-016](#tc-api-016) | injection-shaped input travels as plain data | Edge | P1 | API | Automated | api: PASS |
| [TC-API-017](#tc-api-017) | GET without a CSRF-safe header is blocked | Negative | P2 | API | Automated | api: PASS |
| [TC-API-018](#tc-api-018) | unknown post id returns null (BUG-004) | Boundary | P2 | API | Automated | api: DEFECT |
| [TC-API-019](#tc-api-019) | negative page limit is rejected (BUG-005) | Boundary | P2 | API | Automated | api: DEFECT |

## Case details

### TC-HOME-001

**Homepage loads with header, headlines and story cards** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Front door broken: no traffic reaches stories
- **Preconditions:** Guest
- **Steps:**
  1. Open the homepage
- **Expected:** Logo and login entry visible; at least 3 headline cards; story titles not empty
- **Automation:** `tests/web/home/home.spec.ts`

### TC-HOME-002

**Opening a headline navigates to its article** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Broken story links
- **Preconditions:** Guest
- **Steps:**
  1. Open the homepage
  2. Click the first headline title
- **Expected:** Story page opens; its title matches the card title
- **Automation:** `tests/web/home/home.spec.ts`

### TC-HOME-003

**Homepage stays usable with real ads enabled** · Edge · P2 · Desktop, Mobile · Automated

- **Risk:** Ads covering core navigation; ad-blocking in other tests hiding it
- **Preconditions:** Guest, third-party ads NOT blocked
- **Steps:**
  1. Open the homepage with ads on
  2. Close the interstitial if shown
- **Expected:** Logo and headlines visible and reachable
- **Automation:** `tests/web/home/home.spec.ts`

### TC-AUTH-001

**Login entry point opens the login form** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Users cannot reach login
- **Preconditions:** Guest
- **Steps:**
  1. Open the homepage
  2. Desktop: click "Masuk" in the header. Mobile: open the burger menu, tap "Masuk"
- **Expected:** /login shows email, password (masked) and the submit button
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-002

**Submit stays disabled while email and password are empty** · Negative · P1 · Desktop, Mobile · Automated

- **Risk:** Empty submissions reach the API
- **Preconditions:** Guest on /login
- **Steps:**
  1. Leave both fields empty
- **Expected:** Fields empty; "Masuk" disabled
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-003

**Malformed email is rejected with a format message (4 data rows)** · Negative · P1 · Desktop, Mobile · Automated

- **Risk:** Invalid input accepted / unclear message
- **Preconditions:** Guest on /login
- **Test data:** plainaddress, user@, @kumparan.com, user@@kumparan.com
- **Steps:**
  1. Type a malformed email
  2. Type any password
  3. Leave the password field
- **Expected:** "Harus diisi dengan format email" shown; submit disabled
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-004

**Clearing the password shows a required-field message** · Boundary · P2 · Desktop, Mobile · Automated

- **Risk:** Required-field validation missing
- **Preconditions:** Guest on /login
- **Steps:**
  1. Type a valid-format email
  2. Type then clear the password
  3. Leave the field
- **Expected:** "Tidak boleh kosong" under password; submit disabled
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-005

**Login is protected by a bot challenge before submit** · Negative · P2 · Desktop, Mobile · Automated

- **Risk:** Credential stuffing
- **Preconditions:** Guest on /login
- **Steps:**
  1. Fill a correctly formatted email and password
  2. Do not solve the challenge
- **Expected:** Cloudflare Turnstile present; submit stays disabled
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-006

**Password visibility toggle reveals and hides the password** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Users cannot verify typed password
- **Preconditions:** Guest on /login
- **Steps:**
  1. Type a password
  2. Click the eye icon
  3. Click it again
- **Expected:** Field type text then password; value unchanged
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-AUTH-007

**Alternative sign-in methods and recovery links are offered** · Positive · P3 · Desktop, Mobile · Automated

- **Risk:** Account recovery unreachable
- **Preconditions:** Guest on /login
- **Steps:**
  1. Inspect the login page
- **Expected:** Facebook, Google, phone sign-in, "Lupa Password" and "Daftar Sekarang!" visible
- **Automation:** `tests/web/auth/login.spec.ts`

### TC-ART-001

**Article shows title, byline, date and body** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Core content not rendered
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
- **Expected:** Title, author, channel, publish date and more than one paragraph present
- **Automation:** `tests/web/article/article.spec.ts`

### TC-ART-002

**Engagement bar offers like, comment and share with numeric counters** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Engagement unreachable; NaN/undefined counters
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
- **Expected:** Like, comment, share and report present; counters are numbers
- **Automation:** `tests/web/article/article.spec.ts`

### TC-ART-003

**Page title and canonical URL identify the story** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** SEO / sharing previews wrong
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
- **Expected:** <title> starts with the headline and ends "| kumparan.com"; canonical ends with the story slug
- **Automation:** `tests/web/article/article.spec.ts`

### TC-ART-004

**Unknown story URL returns 404 and keeps site navigation** · Negative · P2 · Desktop, Mobile · Automated

- **Risk:** Soft-404s / dead ends
- **Preconditions:** Guest
- **Steps:**
  1. Open /kumparannews/<non-existent slug>
- **Expected:** HTTP 404; header still usable
- **Automation:** `tests/web/article/article.spec.ts`

### TC-ART-005

**Breadcrumb Home returns to the homepage** · Positive · P3 · Desktop, Mobile · Automated

- **Risk:** Navigation dead end
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click "Beranda" in the breadcrumb
- **Expected:** Homepage with headlines
- **Automation:** `tests/web/article/article.spec.ts`

### TC-LIKE-004

**Guest who taps like is sent to login and the count does not change** · Negative · P1 · Desktop, Mobile · Automated

- **Risk:** Anonymous likes counted (authorization)
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Tap like
  3. Return to the story
- **Expected:** Redirect to /login; like count unchanged
- **Automation:** `tests/web/engagement/like.spec.ts`

### TC-CMT-001

**Comment button opens the story comment thread** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Comments unreachable
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click the comment button
- **Expected:** /<channel>/response/<slug> with the story card, editor "Tulis komentar..." and send button
- **Automation:** `tests/web/engagement/comment.spec.ts`

### TC-CMT-002

**Comment count on the article matches the thread** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Inconsistent counters
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Note the comment count on a story
  2. Open the thread
- **Expected:** Thread header shows "<same count> Komentar"; empty state when 0
- **Automation:** `tests/web/engagement/comment.spec.ts`

### TC-CMT-004

**Guest typing a comment publishes nothing** · Negative · P1 · Desktop, Mobile · Automated

- **Risk:** Anonymous comments published (authorization)
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a thread
  2. Type a comment
- **Expected:** No comment mutation sent; still on the thread. Observation OBS-001: no login prompt while drafting
- **Automation:** `tests/web/engagement/comment.spec.ts`

### TC-RPT-001

**Report opens "Laporkan Konten" with six reasons** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Abuse reporting unreachable
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click "Laporkan tulisan"
- **Expected:** Form shows the story and the six reasons
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-002

**Each of reasons 1-5 can be selected and enables submit (5 data rows)** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** A reason cannot be reported
- **Preconditions:** Report form open
- **Test data:** Spam, Pornografi, Membahayakan, Kekerasan, SARA
- **Steps:**
  1. Select the reason
- **Expected:** Reason checked; "Laporkan" enabled. Not clicked
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-003

**Submit stays disabled until a reason is chosen** · Negative · P1 · Desktop, Mobile · Automated

- **Risk:** Empty reports
- **Preconditions:** Report form open
- **Steps:**
  1. Do not select a reason
- **Expected:** "Laporkan" disabled
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-004

**Cancel from the story returns to the story without reporting** · Negative · P2 · Desktop, Mobile · Automated

- **Risk:** User trapped in the form
- **Preconditions:** Form opened from a story
- **Steps:**
  1. Select a reason
  2. Click "Batal"
- **Expected:** Back on the story
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-005

**Only one reason can be selected at a time** · Boundary · P2 · Desktop, Mobile · Automated

- **Risk:** Options are checkboxes in markup: multi-select ambiguity
- **Preconditions:** Report form open
- **Steps:**
  1. Select reason 1
  2. Select reason 4
- **Expected:** Only reason 4 checked
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-006

**"Lainnya" reveals a free-text field** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Other reason cannot be described
- **Preconditions:** Report form open
- **Steps:**
  1. Select "Lainnya"
- **Expected:** Free-text field appears
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-007

**Guest can complete the report form up to submit** · Edge · P1 · Desktop, Mobile · Automated

- **Risk:** Anonymous reports (authorization), documented as observation
- **Preconditions:** Guest
- **Steps:**
  1. Open the form as a guest
  2. Select a reason
- **Expected:** "Laporkan" enabled for a guest (server behavior on submit not verifiable: submitting is forbidden)
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-008

**Report link for a missing story is handled cleanly** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Crash on bad links
- **Preconditions:** Guest
- **Steps:**
  1. Open /report/story/<non-existent slug>
- **Expected:** No 5xx; no blank page; no story card
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-009

**"Batal" on a report link opened in a new tab takes the reader out of the form** · Edge · P2 · Desktop, Mobile · Automated · linked defect BUG-001

- **Risk:** Readers stuck on the form (dead Cancel button)
- **Preconditions:** Report link opened in a new tab (history.length 1)
- **Steps:**
  1. Open /report/story/<slug> in a new tab
  2. Click "Batal"
- **Expected:** Reader leaves the form (e.g. back to the story)
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-010

**"Lainnya" with an empty reason cannot be submitted** · Boundary · P2 · Desktop, Mobile · Automated

- **Risk:** Reports without a reason
- **Preconditions:** Report form open
- **Steps:**
  1. Select "Lainnya"
  2. Leave the text empty
- **Expected:** "Laporkan" disabled
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-011

**"Lainnya" becomes submittable once a reason is written** · Boundary · P2 · Desktop, Mobile · Automated

- **Risk:** Other reason blocked
- **Preconditions:** Report form open
- **Test data:** "Judul tidak sesuai isi berita"
- **Steps:**
  1. Select "Lainnya"
  2. Type a reason
- **Expected:** "Laporkan" enabled. Not clicked
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-RPT-012

**Keyboard user opening the report form keeps the form URL in the address bar** · Edge · P3 · Desktop · Automated · linked defect BUG-002

- **Risk:** Refresh/share leads to a different page than shown
- **Preconditions:** Story open on desktop
- **Steps:**
  1. Focus "Laporkan tulisan" with the keyboard
  2. Press Enter
  3. Watch the address bar for 4 s
- **Expected:** URL stays /report/story/<slug>
- **Automation:** `tests/web/engagement/report.spec.ts`

### TC-SHR-001

**WhatsApp share carries the headline and the story link** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Shares point to the wrong page
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click the WhatsApp icon
- **Expected:** api.whatsapp.com popup whose text has the headline and kumparan.com/<channel>/<story-id>
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SHR-002

**Share menu lists every share channel** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Channel missing
- **Preconditions:** Guest
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click the "more" share icon
- **Expected:** WhatsApp, Facebook, X, LINE and copy-link options visible
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SHR-003

**Copy link puts the story link on the clipboard and confirms it** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Copy silently fails
- **Preconditions:** Guest; clipboard permission (Chromium)
- **Test data:** Any live story (resolved from the homepage each run)
- **Steps:**
  1. Open a story
  2. Click the copy icon
- **Expected:** "URL berhasil disalin" shown; clipboard holds https://kumparan.com/<channel>/<story-id>?…
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SHR-004

**Facebook, X and LINE shares carry the story link (3 data rows)** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Broken share intents
- **Preconditions:** Share menu open
- **Steps:**
  1. Click the channel
- **Expected:** Popup to the channel host containing the story id
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SHR-005

**Shared links are absolute https URLs on kumparan.com** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Relative or http links in shares
- **Preconditions:** Guest
- **Steps:**
  1. Trigger the WhatsApp share
- **Expected:** Link starts with https://kumparan.com/
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SHR-006

**Share menu closes with its close button** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Modal trap
- **Preconditions:** Share menu open
- **Steps:**
  1. Click the close button
- **Expected:** Menu hidden; still on the story
- **Automation:** `tests/web/engagement/share.spec.ts`

### TC-SRCH-001

**Keyword search from the header returns relevant stories** · Positive · P1 · Desktop, Mobile · Automated

- **Risk:** Search broken
- **Preconditions:** Guest
- **Test data:** banjir
- **Steps:**
  1. Search "banjir" from the header
- **Expected:** /search/banjir with results; top titles mention the keyword
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-002

**Result tabs switch the result type (5 data rows)** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Tabs dead
- **Preconditions:** Results for "banjir"
- **Steps:**
  1. Click a tab
- **Expected:** URL /search/banjir/<video|collection|topik|user|publisher> with that card type
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-003

**"Terbaru" sort switches to newest-first** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Sort ignored
- **Preconditions:** Results for "banjir"
- **Steps:**
  1. Click "Terbaru"
- **Expected:** Terbaru active, Relevansi inactive, results shown
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-004

**Nonsense keyword shows the "not found" state** · Negative · P2 · Desktop, Mobile · Automated

- **Risk:** Blank page on no results
- **Preconditions:** Guest
- **Test data:** qzxwvkjhgf123zzq
- **Steps:**
  1. Search a nonsense keyword
- **Expected:** 0 results; "Story tidak ditemukan"
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-005

**Submitting an empty query stays on the search landing page** · Boundary · P2 · Desktop, Mobile · Automated

- **Risk:** Empty query errors
- **Preconditions:** Guest
- **Steps:**
  1. Press Enter in an empty search box
- **Expected:** /search with no results
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-006

**One-character query is accepted** · Boundary · P3 · Desktop, Mobile · Automated

- **Risk:** Minimum length rejected
- **Preconditions:** Guest
- **Test data:** a
- **Steps:**
  1. Open /search/a
- **Expected:** Results or the not-found state; no error
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-007

**200-character query is handled without error** · Boundary · P3 · Desktop, Mobile · Automated

- **Risk:** Long input crashes
- **Preconditions:** Guest
- **Test data:** "x" x 200
- **Steps:**
  1. Open /search/<200 x>
- **Expected:** No 5xx; results or not-found state
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-008

**HTML typed into search is shown as text, never rendered** · Edge · P1 · Desktop, Mobile · Automated

- **Risk:** Reflected XSS
- **Preconditions:** Guest
- **Test data:** <b>qaprobe</b>
- **Steps:**
  1. Search <b>qaprobe</b>
- **Expected:** URL-encoded query; no <b> element with the probe text in the page
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-009

**Emoji and unicode queries are encoded and searched** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Encoding errors
- **Preconditions:** Guest
- **Test data:** 🙂 banjir
- **Steps:**
  1. Search "🙂 banjir"
- **Expected:** URL contains %F0%9F%99%82; results or not-found
- **Automation:** `tests/web/search/search.spec.ts`

### TC-SRCH-010

**Query with "&" is encoded, not split** · Edge · P3 · Desktop, Mobile · Automated

- **Risk:** Query truncated at &
- **Preconditions:** Guest
- **Test data:** food & travel
- **Steps:**
  1. Search "food & travel"
- **Expected:** /search/food%20%26%20travel with results
- **Automation:** `tests/web/search/search.spec.ts`

### TC-NAV-001

**Channel menu opens the News channel** · Positive · P2 · Desktop, Mobile · Automated

- **Risk:** Channel navigation broken
- **Preconditions:** Guest
- **Steps:**
  1. Desktop: click "News" in the menu bar. Mobile: tap "News" in the top-nav
- **Expected:** /channel/news with channel content
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-NAV-002

**Mobile side menu opens and closes** · Positive · P2 · Mobile · Automated

- **Risk:** Mobile users cannot reach login/settings
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Tap the burger menu
  2. Tap close
- **Expected:** Drawer slides in with "Mode Gelap", then out
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-NAV-003

**Dark mode switches the theme and survives a reload** · Positive · P3 · Desktop, Mobile · Automated

- **Risk:** Preference lost
- **Preconditions:** Guest, light theme
- **Steps:**
  1. Toggle dark mode
  2. Reload
- **Expected:** Body background rgb(24,24,24); localStorage theme=dark; still dark after reload
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-NAV-004

**"Lihat lainnya" on trending opens the Trending page** · Positive · P2 · Desktop · Automated

- **Risk:** Discovery dead end
- **Preconditions:** Guest on desktop
- **Steps:**
  1. Click "Lihat lainnya" under Trending
- **Expected:** /trending with trending stories
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-NAV-005

**Homepage loads without first-party JavaScript errors** · Edge · P2 · Desktop, Mobile · Automated · linked defect BUG-003

- **Risk:** Hydration failures slow interactivity
- **Preconditions:** Guest
- **Steps:**
  1. Open the homepage
  2. Collect uncaught page errors
- **Expected:** No uncaught errors
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-NAV-006

**Mobile top-nav strip opens Trending** · Positive · P2 · Mobile · Automated

- **Risk:** Mobile discovery broken
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Tap "Trending" in the top-nav strip
- **Expected:** /trending with trending stories
- **Automation:** `tests/web/navigation/navigation.spec.ts`

### TC-AGT-001

**Search a common term and switch every result tab** · Positive · P2 · Desktop · Automated (agent-generated)

- **Risk:** Search tabs broken
- **Preconditions:** Guest
- **Steps:**
  1. Search "banjir"
  2. Click each result tab
- **Expected:** Each tab has its own URL and result card type
- **Automation:** `tests/agent/search/search.agent.spec.ts`

### TC-AGT-002

**No-result term shows the empty state** · Negative · P2 · Desktop · Automated (agent-generated)

- **Risk:** Blank page on no results
- **Preconditions:** Guest
- **Steps:**
  1. Search a nonsense term
- **Expected:** story-not-found "Story tidak ditemukan"; no cards; tabs still shown
- **Automation:** `tests/agent/search/search.agent.spec.ts`

### TC-AGT-003

**Boundary queries: empty, 1 char, 300 chars, special characters** · Boundary · P2 · Desktop · Automated (agent-generated)

- **Risk:** Input crashes or script injection
- **Preconditions:** Guest
- **Steps:**
  1. Submit an empty query, "a", 300 x "x", and a script-tag string with & and %20
- **Expected:** No crash, no dialog; results or empty state each time
- **Automation:** `tests/agent/search/search.agent.spec.ts`

### TC-AGT-004

**Sort Terbaru/Relevansi and clear the query with x-circle** · Edge · P3 · Desktop · Automated (agent-generated)

- **Risk:** Sort or clear state bugs
- **Preconditions:** Guest
- **Steps:**
  1. Search "banjir jakarta"
  2. Toggle Terbaru then Relevansi
  3. Click x-circle
- **Expected:** Toggles swap active state; clear returns to /search with an empty box
- **Automation:** `tests/agent/search/search.agent.spec.ts`

### TC-AGT-005

**Share bar: WhatsApp popup and copy link from a headline story** · Positive · P1 · Desktop · Automated (agent-generated)

- **Risk:** Shares point to the wrong page
- **Preconditions:** Guest
- **Steps:**
  1. Open the first headline
  2. WhatsApp share
  3. Copy link
- **Expected:** Popup text has the headline and link; clipboard has /<channel>/<story-id>
- **Automation:** `tests/agent/share/share.agent.spec.ts`

### TC-AGT-006

**Share menu lists channels, closes, and works for a non-ASCII headline** · Edge · P2 · Desktop · Automated (agent-generated)

- **Risk:** Encoding or modal state bugs
- **Preconditions:** Guest
- **Steps:**
  1. Open the share menu
  2. Close it
  3. Share a story found by searching an accented word
- **Expected:** Five channels; closes cleanly; share text keeps the accented headline
- **Automation:** `tests/agent/share/share.agent.spec.ts`

### TC-AGT-007

**Header and sub-menu routes (Trending, Breaking News, Audio Story, More)** · Positive · P2 · Desktop · Automated (agent-generated)

- **Risk:** Navigation dead ends
- **Preconditions:** Guest
- **Steps:**
  1. Lihat lainnya
  2. Logo
  3. Breaking News
  4. Audio Story
  5. More menu
- **Expected:** Each route loads its content; More shows Galeri Foto, Kabar Daerah, Polling
- **Automation:** `tests/agent/navigation/navigation.agent.spec.ts`

### TC-AGT-008

**Guest notification, theme persistence across pages, invalid route** · Edge · P2 · Desktop · Automated (agent-generated)

- **Risk:** Auth gate, preference or 404 handling
- **Preconditions:** Guest
- **Steps:**
  1. Click the bell
  2. Toggle dark mode, visit /trending and /search
  3. Open an invalid route
- **Expected:** Bell redirects to /login; dark persists everywhere; invalid route has no 5xx and the logo returns home
- **Automation:** `tests/agent/navigation/navigation.agent.spec.ts`

### TC-AGT-009

**Share modal closes with Escape like an accessible dialog** · Negative · P2 · Desktop · Automated (agent-generated) · linked defect BUG-006

- **Risk:** Keyboard users trapped (WCAG 2.1.2)
- **Preconditions:** Share menu open
- **Steps:**
  1. Press Escape
- **Expected:** Modal closes
- **Automation:** `tests/agent/share/share.agent.spec.ts`

### TC-AGT-010

**Mobile burger side menu: open, every item and link, close (x3)** · Positive · P2 · Mobile · Automated (agent-generated)

- **Risk:** Mobile navigation hub broken
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Open the menu
  2. Check rows and hrefs
  3. Close; repeat 3 times
- **Expected:** All rows with correct hrefs; drawer opens and closes reliably
- **Automation:** `tests/agent/mobile/mobile.agent.spec.ts`

### TC-AGT-011

**Mobile top-nav strip routes** · Positive · P2 · Mobile · Automated (agent-generated)

- **Risk:** Mobile discovery broken
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Tap Breaking News, Audio Story, Trending, News
- **Expected:** Each route loads with the mobile header
- **Automation:** `tests/agent/mobile/mobile.agent.spec.ts`

### TC-AGT-012

**Mobile share bar and share modal** · Positive · P1 · Mobile · Automated (agent-generated)

- **Risk:** Mobile sharing broken
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Open a headline
  2. Open the share modal
  3. Close and reopen twice
- **Expected:** Inline icons; six channels; modal closes without leaving the story
- **Automation:** `tests/agent/mobile/mobile.agent.spec.ts`

### TC-AGT-013

**Mobile guest login entry from the side menu (form only, never submitted)** · Positive · P1 · Mobile · Automated (agent-generated)

- **Risk:** Mobile users cannot reach login
- **Preconditions:** Guest on mobile
- **Steps:**
  1. Open the menu
  2. Tap Masuk
  3. Toggle password visibility
- **Expected:** Empty login form with all options; nothing submitted
- **Automation:** `tests/agent/mobile/mobile.agent.spec.ts`

### TC-API-001

**post(id) returns the post with its author** · Positive · P1 · API · Automated

- **Risk:** Core read broken
- **Preconditions:** None
- **Test data:** { id: "1" }
- **Steps:**
  1. Query post with $id
- **Expected:** 200; no errors; post matches contract; author id 1
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-002

**posts paginate with page size and total count** · Positive · P1 · API · Automated

- **Risk:** Pagination wrong
- **Preconditions:** None
- **Test data:** { paginate: { page: 2, limit: 5 } }
- **Steps:**
  1. Query posts page 2, limit 5
- **Expected:** 200; ids 6-10; totalCount 100
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-003

**user query resolves nested posts for that user only** · Positive · P1 · API · Automated

- **Risk:** Nested resolver leaks other data
- **Preconditions:** None
- **Steps:**
  1. Query user 2 with 3 posts
- **Expected:** 200; 3 posts all belonging to user 2
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-004

**album returns owner and photos with valid URLs** · Positive · P2 · API · Automated

- **Risk:** Broken media links
- **Preconditions:** None
- **Steps:**
  1. Query album 1 with 4 photos
- **Expected:** 200; 4 photos with valid URLs
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-005

**keyword search returns only matching posts** · Positive · P2 · API · Automated

- **Risk:** Search returns noise
- **Preconditions:** None
- **Test data:** qui est esse
- **Steps:**
  1. Query posts with search.q
- **Expected:** 200; every title contains the keyword
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-006

**posts sort by id descending** · Positive · P3 · API · Automated

- **Risk:** Sort ignored
- **Preconditions:** None
- **Steps:**
  1. Query posts sorted id DESC, limit 3
- **Expected:** ids 100, 99, 98
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-007

**last page holds the remainder** · Boundary · P2 · API · Automated

- **Risk:** Off-by-one at the end
- **Preconditions:** None
- **Steps:**
  1. Query page 4, limit 30
- **Expected:** 10 posts, ids 91-100
- **Automation:** `tests/api/graphql/queries.spec.ts`

### TC-API-008

**createPost returns the new post echoing the input** · Positive · P1 · API · Automated

- **Risk:** Create broken
- **Preconditions:** None
- **Steps:**
  1. Mutation createPost with $input
- **Expected:** 200; returned post equals input plus id
- **Automation:** `tests/api/graphql/mutations.spec.ts`

### TC-API-009

**updatePost returns the new title** · Positive · P1 · API · Automated

- **Risk:** Update broken
- **Preconditions:** None
- **Steps:**
  1. Mutation updatePost id 1
- **Expected:** 200; title updated
- **Automation:** `tests/api/graphql/mutations.spec.ts`

### TC-API-010

**deletePost confirms the deletion** · Positive · P1 · API · Automated

- **Risk:** Delete broken
- **Preconditions:** None
- **Steps:**
  1. Mutation deletePost id 1
- **Expected:** 200; true
- **Automation:** `tests/api/graphql/mutations.spec.ts`

### TC-API-011

**createPost without the required title is rejected** · Negative · P1 · API · Automated

- **Risk:** Invalid records created
- **Preconditions:** None
- **Steps:**
  1. createPost with input missing title
- **Expected:** 200; no data; BAD_USER_INPUT naming the title field
- **Automation:** `tests/api/graphql/mutations.spec.ts`

### TC-API-012

**malformed document is a parse error** · Negative · P1 · API · Automated

- **Risk:** Unclear errors
- **Preconditions:** None
- **Steps:**
  1. Send an unterminated document
- **Expected:** 400; GRAPHQL_PARSE_FAILED
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-013

**unknown field fails schema validation** · Negative · P1 · API · Automated

- **Risk:** Schema not enforced
- **Preconditions:** None
- **Steps:**
  1. Query a non-existent field
- **Expected:** 400; GRAPHQL_VALIDATION_FAILED
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-014

**missing required variable is bad input** · Negative · P1 · API · Automated

- **Risk:** Required input not enforced
- **Preconditions:** None
- **Steps:**
  1. Send GetPost without $id
- **Expected:** 200; no data; BAD_USER_INPUT
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-015

**wrong variable type is bad input** · Negative · P2 · API · Automated

- **Risk:** Type coercion bugs
- **Preconditions:** None
- **Steps:**
  1. Send $id as an object
- **Expected:** 200; BAD_USER_INPUT "ID cannot represent value"
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-016

**injection-shaped input travels as plain data** · Edge · P1 · API · Automated

- **Risk:** Query injection
- **Preconditions:** None
- **Steps:**
  1. Search with a GraphQL-injection-shaped string as a variable
- **Expected:** 200; no errors; empty result; nothing deleted
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-017

**GET without a CSRF-safe header is blocked** · Negative · P2 · API · Automated

- **Risk:** CSRF
- **Preconditions:** None
- **Steps:**
  1. Send the query via GET
- **Expected:** 400; CSRF message
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-018

**unknown post id returns null** · Boundary · P2 · API · Automated · linked defect BUG-004

- **Risk:** Ghost objects rendered by clients
- **Preconditions:** None
- **Steps:**
  1. Query post 999999
- **Expected:** post is null
- **Automation:** `tests/api/graphql/negative.spec.ts`

### TC-API-019

**negative page limit is rejected** · Boundary · P2 · API · Automated · linked defect BUG-005

- **Risk:** Unbounded responses
- **Preconditions:** None
- **Steps:**
  1. Query posts with limit -5
- **Expected:** BAD_USER_INPUT
- **Automation:** `tests/api/graphql/negative.spec.ts`

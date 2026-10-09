# kumparan.com Search, Share and Navigation (Desktop) Test Plan

## Application Overview

Desktop test plan for kumparan.com Search, Share and Navigation. Read-only on production: no login, comment, report, follow or publishing. Locators use getByTestId (data-qa-id). Verified live: the empty search state is data-qa-id "story-not-found" with text "Story tidak ditemukan"; desktop header has hd-logo, hd-home, input-search, x-circle, hd-theme, hd-notification, hd-login, create-story, more-vertical (more-popover-menu).

## Test Scenarios

### 1. Search

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-AGT-001 Search a common term and switch result tabs (positive)

**File:** `tests/search/tc-agt-001-search-tabs.spec.ts`

**Steps:**
  1. From the homepage, fill getByTestId('input-search') with 'banjir' and press Enter.
    - expect: URL matches /search/banjir
    - expect: Story result cards are visible
    - expect: tab-story, tab-video-story, tab-kumparan_plus, tab-topic, tab-user, tab-publisher are visible
  2. Click tab-video-story, then tab-kumparan_plus, tab-topic, tab-user, tab-publisher in turn (do not click btn-follow).
    - expect: URLs end in /video, /collection, /topik, /user, /publisher respectively
    - expect: Each tab shows video-story-card, collection-card, search-topic-result-card, search-user-result-card, search-publisher-result-card

#### 1.2. TC-AGT-002 No-result term shows empty state (negative)

**File:** `tests/search/tc-agt-002-search-empty.spec.ts`

**Steps:**
  1. Search for the nonsense term 'zzqxjkvv1234' via input-search + Enter.
    - expect: URL is /search/zzqxjkvv1234
    - expect: getByTestId('story-not-found') is visible with text 'Story tidak ditemukan'
    - expect: No news-card-gallery-v2 results
    - expect: Tabs and sort controls remain visible

#### 1.3. TC-AGT-003 Boundary queries: empty, single char, very long, special characters (edge)

**File:** `tests/search/tc-agt-003-search-boundary.spec.ts`

**Steps:**
  1. Focus input-search and press Enter with an empty value.
    - expect: No crash; page stays usable (no navigation to an error page)
  2. Search 'a', then a 300-character string, then '<script>alert(1)</script> & %20 "'.
    - expect: Each search resolves to /search/<encoded term> with results or story-not-found
    - expect: No script executes or dialog appears; no 5xx error page

#### 1.4. TC-AGT-004 Sort Terbaru/Relevansi and clear with x-circle (edge)

**File:** `tests/search/tc-agt-004-search-sort-clear.spec.ts`

**Steps:**
  1. Search 'banjir with spaces' style term 'banjir jakarta'; check the URL.
    - expect: Term is URL-encoded in the path (e.g. banjir%20jakarta)
  2. Click newest-non-active, then relevant-non-active.
    - expect: newest-active appears after the first click and relevant-non-active is shown
    - expect: relevant-active returns after the second click; results re-render
  3. Click getByTestId('x-circle').
    - expect: URL becomes /search
    - expect: popular-list is visible and input-search is empty

### 2. Share

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-AGT-005 Share bar WhatsApp popup and copy link on an article (positive)

**File:** `tests/share/tc-agt-005-share-whatsapp-copy.spec.ts`

**Steps:**
  1. Open the first article from the homepage headline; scroll to getByTestId('share-wrapper').
    - expect: sosmed-whatsapp, copy-circle and more-vertical are visible
  2. Click sosmed-whatsapp and capture the popup via page.waitForEvent('popup'); read its URL only, do not interact with it.
    - expect: Popup URL is a WhatsApp URL containing the article headline and an absolute https://kumparan.com link
  3. Grant clipboard permissions, click copy-circle.
    - expect: Toast 'URL berhasil disalin' appears
    - expect: Clipboard text is an absolute https://kumparan.com/... URL equal to the article URL

#### 2.2. TC-AGT-006 Share more menu lists channels and closes; closing leaves article intact (edge)

**File:** `tests/share/tc-agt-006-share-more-menu.spec.ts`

**Steps:**
  1. On an article click more-vertical in share-wrapper.
    - expect: modal-view opens listing all share channels (WhatsApp, copy link and others)
  2. Close the modal with its close button, then press Escape after reopening it.
    - expect: modal-view is hidden both times
    - expect: Article URL and content are unchanged and no popup opened
  3. Repeat on an article with a long or non-ASCII headline (e.g. search a term with accents/emoji, open a result).
    - expect: Share text carries the full or properly encoded headline; the link stays absolute https on kumparan.com

### 3. Navigation

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-AGT-007 Header and sub-menu routes (positive)

**File:** `tests/navigation/tc-agt-007-header-routes.spec.ts`

**Steps:**
  1. From the homepage click ft-loadmore 'Lihat lainnya' in the Trending section.
    - expect: URL is /trending; tab-semua and trending-stories-card are visible
  2. Click hd-logo, then via the header sub menu open Breaking News and Audio Story, using hd-home to return each time.
    - expect: Logo and hd-home return to '/'
    - expect: /breakingnews shows breaking-news-hero-card; /audio-story shows regular-audio-story-card
  3. Click more-vertical in main-menu.
    - expect: more-popover-menu opens with category entries (e.g. Galeri Foto, Kabar Daerah, Polling)

#### 3.2. TC-AGT-008 Guest notification, theme toggle persistence, invalid route (negative/edge)

**File:** `tests/navigation/tc-agt-008-guest-theme-404.spec.ts`

**Steps:**
  1. Click hd-notification as a guest (do not submit any login form).
    - expect: Guest is sent to /login or a login prompt appears; no account action performed
  2. Go back to home, click hd-theme (moon), then navigate to /trending and to /search/banjir.
    - expect: Theme switches (sun icon replaces moon) and persists across both pages and a reload
  3. Navigate directly to /this-page-does-not-exist-12345.
    - expect: A not-found page is shown (no blank page or 5xx) and hd-logo still returns to '/'

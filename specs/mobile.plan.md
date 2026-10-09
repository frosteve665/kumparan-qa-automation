# kumparan Mobile Test Plan (m.kumparan.com, mobile-chrome)

## Application Overview

Mobile-specific scenarios for https://m.kumparan.com on Playwright project "mobile-chrome" (viewport about 412x839). Seed: tests/seed.spec.ts. All selectors are data-qa-id values (use getByTestId, configured to data-qa-id) recorded from the live site on 2026-10-10. Safety rules: never click btn-save (login submit), btn-report / "Laporkan Tulisan", comment-send, login or logout actions. Key finding: the side menu stays in the DOM when closed (it is translated to x=-280 and the aria-label "navigation side" region keeps visibility: visible), so assert open/closed with toBeInViewport() or bounding box x, not toBeAttached/toBeHidden. Home content loads lazily and the interstitial/sticky ads may overlay clicks; wait for the target test id first.

## Test Scenarios

### 1. Mobile-specific navigation, share and guest login entry

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-AGT-010 Burger side menu: open, check items, close

**File:** `tests/mobile/burger-side-menu.spec.ts`

**Steps:**
  1. Start from the seed state: m.kumparan.com home as a guest on mobile-chrome. Assert getByTestId('burger-menu') is visible (a 40px wide button with img getByTestId('hamburger-menu')) and that the drawer is off-screen (getByTestId('close-sidebar') not in viewport; drawer bounding x is -280).
    - expect: burger-menu and hamburger-menu are visible in the header-top bar
    - expect: The side drawer is not in the viewport (toBeInViewport fails for close-sidebar)
  2. Click getByTestId('burger-menu').
    - expect: The drawer slides in: the region aria-label 'navigation side' is 280px wide at x=0, heading 'Menu' is visible
    - expect: getByTestId('close-sidebar') is in viewport (about 32x32 at x=227,y=8)
    - expect: URL stays https://m.kumparan.com/
  3. Check the top rows by test id: getByTestId('anchor-login-wrapper') has text 'Masuk' (with getByTestId('profile') icon and label-list-item-masuk); getByTestId('label-list-item-berlangganan') has text 'Berlangganan' and href /subscription (with ic-new-kumplus-outline-black); getByTestId('list-item-card') first has text 'Mode Gelap' (with getByTestId('moon') and an unchecked checkbox); getByTestId('label-list-item-Informasi Kerja Sama') is visible (with getByTestId('mail')).
    - expect: All four rows are visible inside the drawer
    - expect: The Mode Gelap checkbox is unchecked by default
  4. Check the navigation rows by href: label-list-item-beranda (/), label-list-item-video story (/video-story), label-list-item-audio story (/audio-story, contains badge 'Baru'), label-list-item-satu indonesia awards (/topic/astra-satu-indonesia-awards), label-list-item-green initiative (/topic/green-initiative), label-list-item-trending (/trending), label-list-item-kabar daerah (/kabar-daerah), label-list-item-galeri foto (/topic/galeri-foto), label-list-item-opini & cerita (/opini-cerita), label-list-item-peringkat penulis (/user-campaign). Use toHaveAttribute('href', ...) and do not click them.
    - expect: Each row exists with the listed href
  5. Scroll the drawer and check the channel rows: label-list-item-news, -entertainment, -mom, -food & travel, -tekno, -otomotif, -woman, -bola & sports, -bisnis, -bolanita, each with href /channel/<slug> (bola-sports, food-travel for the two-word ones). Then check getByTestId('label-cara-menulis') 'Cara Menulis di kumparan', getByTestId('list-label-tentang-kumparan') with getByTestId('chevron-down'), social links label-list-item-instagram, -facebook, -tiktok, -youtube, -whatsapp, -x (external https hrefs, do not click) and getByTestId('app-version') containing 'Version'.
    - expect: 10 channel rows, 6 social rows and the app-version footer are present
    - expect: Social links are external https URLs and are not clicked
  6. Click getByTestId('close-sidebar').
    - expect: The drawer slides out: close-sidebar is no longer in the viewport (drawer x returns to -280)
    - expect: URL is still https://m.kumparan.com/ and the home content (getByTestId('homepage')) is visible and clickable
  7. Boundary: repeat open (burger-menu) and close (close-sidebar) 3 times.
    - expect: Each cycle shows then hides the drawer with no navigation and no stuck overlay; final state has close-sidebar out of the viewport
  8. Edge: with the drawer open, click getByTestId('list-item-card') filtered by 'Mode Gelap' only if the theme is restored afterwards, otherwise skip. Do not click Informasi Kerja Sama or Tentang kumparan (crawl showed no visible effect).
    - expect: No console-breaking behaviour; page remains on / (optional step)
  9. Final outcome assertions.
    - expect: After close, getByTestId('close-sidebar') is not in the viewport
    - expect: page.url() equals https://m.kumparan.com/
    - expect: getByTestId('burger-menu') is visible and enabled again

#### 1.2. TC-AGT-011 Top-nav strip routes (nb-* items and topnav)

**File:** `tests/mobile/top-nav-strip.spec.ts`

**Steps:**
  1. Open https://m.kumparan.com/ on mobile-chrome. Assert the strip: getByTestId('nb-top-news') 'Breaking News' (href /breakingnews), getByTestId('nb-video-story') 'Video Story' (no href, click handler), getByTestId('nb-audio-story') 'Audio Story' (/audio-story), getByTestId('nb-trending') 'Trending' (/trending), and 10 getByTestId('topnav') links: News /channel/news, Bisnis /channel/bisnis, Tekno /channel/tekno, Entertainment /channel/entertainment, Bola & Sports /channel/bola-sports, Mom /channel/mom, Food & Travel /channel/food-travel, Otomotif /channel/otomotif, Woman /channel/woman, Bolanita /channel/bolanita.
    - expect: 4 nb-* items and 10 topnav items are rendered
    - expect: Strip scrolls horizontally; use scrollIntoViewIfNeeded for items beyond the viewport
  2. Click getByTestId('nb-top-news'). Wait for URL.
    - expect: URL is https://m.kumparan.com/breakingnews
    - expect: getByTestId('breaking-news-hero-card') is visible; also breaking-news-logo, breaking-news-title-section, breaking-news-title present
  3. Go back to home, click getByTestId('nb-audio-story').
    - expect: URL is https://m.kumparan.com/audio-story
    - expect: getByTestId('regular-audio-story-card') is visible with audio-story-card-title, audio-story-share-whatsapp-button, audio-story-share-more-button, mini-player present
  4. Go back to home, click getByTestId('nb-trending').
    - expect: URL is https://m.kumparan.com/trending
    - expect: getByTestId('tab-semua'), getByTestId('tab-item') and getByTestId('trending-stories-card') are visible
  5. Go back to home, click getByTestId('nb-video-story').
    - expect: URL matches /\/kumparantekno\/video\/\d+/ (observed: /kumparantekno/video/1791538753773622536; the id changes, assert by regex)
    - expect: Page content may still show the home layout for a few seconds; wait for pause-circle or volume-x (FindVideoStoryByID) per docs with a 10s timeout
  6. Go back to home, click getByTestId('topnav').filter({hasText:'News'}).first().
    - expect: URL is https://m.kumparan.com/channel/news
    - expect: Title is 'Berita Hari Ini Terkini - kumparan'
    - expect: getByTestId('channel-feed-section') and getByTestId('headline-carousel') are visible
  7. Negative/edge: for each of the other 9 topnav channels click and assert the URL equals the href listed; navigate back with page.goBack() and verify home returns (hd-logo visible). Also click getByTestId('hd-search') (/search) and getByTestId('hd-notification') (/notifications as seen in the href; docs say guest ends at /login) and assert the URL, without typing or submitting anything.
    - expect: Each channel lands on /channel/<slug>
    - expect: hd-search lands on /search; hd-notification lands on /notifications or redirects to /login for a guest (record actual)
  8. Final outcome assertions.
    - expect: Every clicked item produced the exact URL pattern above
    - expect: Each destination shows its probe test id: breaking-news-hero-card, regular-audio-story-card, trending-stories-card, channel-feed-section
    - expect: The persistent header (burger-menu, hd-logo) is visible on every destination

#### 1.3. TC-AGT-012 Mobile share bar and share modal on an article

**File:** `tests/mobile/share-bar-modal.spec.ts`

**Steps:**
  1. From home click the first getByTestId('headline-card') (for example https://m.kumparan.com/kumparannews/ri-malaysia-bahas-kenaikan-batas-usia-dan-upah-minimum-pmi-jadi-2-000-ringgit-28LNGuX0Spk) or open any article URL. Wait for the title containing '| kumparan.com'.
    - expect: Article page loaded, URL contains /kumparannews/ or another publisher path
  2. Scroll getByTestId('share-wrapper') into view (it sits under the headline at about y=783 on the first load, 232x24, next to btn-like and btn-comment). Assert the inline icons: getByTestId('sosmed-instagram-circle'), getByTestId('sosmed-whatsapp-white'), getByTestId('copy-circle'), getByTestId('more-vertical').
    - expect: share-wrapper is visible with the 4 icons; the bar also sits beside getByTestId('btn-like') and getByTestId('btn-comment') (do not click them)
  3. Click getByTestId('more-vertical').
    - expect: getByTestId('modal-view') is visible, about 288x297, centered on the 412px viewport
    - expect: getByTestId('modal-header') shows title 'Bagikan' with getByTestId('btn-close-modal')
  4. Assert the channels inside modal-view: share-ig ('Stories', sosmed-instagram-circle), share-whatsapp ('WhatsApp', sosmed-whatsapp-circle), share-fb ('Facebook', sosmed-facebook-circle), share-twitter ('X', sosmed-twitter-new-circle), share-line ('Line', sosmed-line-circle), share-copy-clipboard ('Salin', copy-circle). Do not click any of them, since they open external popups or write to the clipboard.
    - expect: Six share channel buttons are visible, labelled Stories, WhatsApp, Facebook, X, Line, Salin
    - expect: A 'Laporkan Tulisan' link getByTestId('btn-report') exists inside the modal with href starting /report/story/ (DO NOT click it)
  5. Click getByTestId('btn-close-modal').
    - expect: getByTestId('modal-view') is no longer in the DOM
    - expect: getByTestId('share-wrapper') is still visible and the URL has not changed
  6. Boundary: reopen via more-vertical and close again 2 times; also verify the page does not scroll to top after closing.
    - expect: Modal opens and closes consistently
  7. Optional (needs clipboard permission granted on the context): click getByTestId('copy-circle') in the bar and wait for the toast 'URL berhasil disalin'. Do not click WhatsApp or other external channels.
    - expect: Toast containing 'URL berhasil disalin' appears (per TC-SHR-003)
  8. Final outcome assertions.
    - expect: Modal opened with all 6 channels and the header 'Bagikan' and closed through btn-close-modal
    - expect: No navigation occurred, URL equals the article URL, no popup page was opened

#### 1.4. TC-AGT-013 Guest login entry from the side menu (open form only, never submit)

**File:** `tests/mobile/guest-login-entry.spec.ts`

**Steps:**
  1. Start as a guest on https://m.kumparan.com/ (fresh context, no storage state). Click getByTestId('burger-menu') and assert getByTestId('close-sidebar') is in the viewport.
    - expect: Drawer is open
  2. Assert getByTestId('anchor-login-wrapper') is visible, contains text 'Masuk' and has getByTestId('profile') icon plus getByTestId('label-text-masuk'). Also assert there is no logout / profile name row for a guest.
    - expect: Guest sees 'Masuk' as the first drawer row
  3. Click getByTestId('anchor-login-wrapper'). Wait for URL.
    - expect: URL is https://m.kumparan.com/login
    - expect: The drawer is closed or covers nothing: the form is not obscured
  4. Assert the form fields: getByTestId('input-email') (text, placeholder/label 'Email'), getByTestId('input-password') (type password), getByTestId('right-add-on') with getByTestId('eye'), getByTestId('btn-forgot-password') 'Lupa Password' (href /forgot-password), getByTestId('btn-register') 'Daftar Sekarang!' (href /register), social buttons getByTestId('btn-login-fb') 'Facebook', getByTestId('btn-login-google') 'Google', getByTestId('btn-login-phone') 'Nomor Handphone', and getByTestId('btn-save') with text 'Masuk' (assert presence only).
    - expect: The main-content shows the heading 'Masuk' and the text 'Login dulu biar bisa kom...'
    - expect: All fields and buttons are visible; input-email and input-password are empty
  5. Non-submitting interaction: click getByTestId('right-add-on') (the eye icon) once to reveal the password, then again. No credentials are typed.
    - expect: input-password type toggles password to text and back to password when the eye is toggled (docs: eye becomes eye-off)
  6. Negative/edge: do NOT fill input-email or input-password, do NOT click btn-save, btn-login-fb, btn-login-google or btn-login-phone (Cloudflare human check and protected flows). Optionally navigate back with page.goBack().
    - expect: Back returns to / with the burger-menu available
  7. Final outcome assertions.
    - expect: page.url() is https://m.kumparan.com/login
    - expect: input-email, input-password, btn-save, btn-register and btn-forgot-password are visible
    - expect: No network request to a login or auth submit endpoint was made by the test, and the guest session remains signed out

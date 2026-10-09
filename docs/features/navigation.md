# Navigation
A reader moves around kumparan with the header, the mobile burger menu and bottom nav, and channel/trending/topic links.

## Entry points
| Platform | From | Element (data-qa-id) | Lands on |
|---|---|---|---|
| Both | most pages | `hd-logo`, `hd-home` | `/` |
| Desktop | home | `ft-loadmore` "Lihat lainnya" | `/trending` |
| Desktop | home | `promoted-topic` | `/topic/pimpinan-ponpes-...` |
| Mobile | home | `burger-menu` | overlay (`close-sidebar`, `anchor-login-wrapper`, `profile`) |
| Mobile | home | `nb-top-news` "Breaking News" | `/breakingnews` |
| Mobile | home | `nb-video-story` | `/kumparantekno/video/:id` |
| Mobile | home | `nb-audio-story` | `/audio-story` |
| Mobile | home | `nb-trending` | `/trending` |
| Mobile | home | `topnav` "News" | `/channel/news` |
| Mobile | home | `hd-search` | `/search` |
| Both | any | `hd-theme` | toggles theme (`sun` appears) |

## Flow
```mermaid
flowchart LR
  H["/"] -->|ft-loadmore| TR["/trending"]
  H -->|promoted-topic| TP["/topic/..."]
  H -->|topnav| CH["/channel/news"]
  H -->|nb-top-news| BN["/breakingnews"]
  H -->|nb-video-story| VS["/kumparantekno/video/:id"]
  H -->|nb-audio-story| AS["/audio-story"]
  H -->|nb-trending| TR
  H -->|burger-menu| SM[Side menu overlay]
  SM -->|close-sidebar / close| H
  SM -->|anchor-login-wrapper| L["/login"]
```

## Expected results (proof it worked)
- `/trending` shows `tab-semua`, `tab-item`, `trending-stories-card` (FindCompactStoryBySlug).
- `/channel/news` fires GetHeadlineChannelCount, FindContentFeedByChannelSlug, FindTrendingStoriesByChannelSlug.
- `/breakingnews` shows `breaking-news-hero-card` (FindAllCollectionsQuery); `/audio-story` shows `regular-audio-story-card`.
- Video story page shows `pause-circle`, `volume-x` (FindVideoStoryByID).
- Burger menu shows `close-sidebar`, `anchor-login-wrapper`, `profile`, `ic-new-kumplus-outline-black`.
- Side menu: `list-item-card` "Mode Gelap" and `list-label-tentang-kumparan` show no visible effect in the crawl; `close-sidebar` and `close` update the page.
- `hd-logo` and `hd-home` on home: no visible effect (already there).

## Desktop vs mobile differences
- Desktop: logo, `hd-home`, inline `input-search`, `hd-theme`, `hd-login`. Mobile: burger menu, `hd-search`, `hd-notification`, bottom nav `nb-*`, `topnav`.
- The side-menu page exists on mobile only.
- Page objects: `Header` (`logo`, `searchEntry`, `themeToggle`, `burgerMenu`, `loginEntry`, `openSideMenu()`), `HomePage`.

## Test ideas
Positive
- Homepage loads with header: TC-HOME-001; headline opens article: TC-HOME-002. Header and menu routes: TC-NAV-001..006 (planned).
- Each `nb-*` and `topnav` link lands on its route: NEW.
Negative
- `hd-notification` as guest goes to `/login`: NEW.
Boundary
- Burger menu opens and closes repeatedly: NEW.
Edge
- Dark mode toggle persists across navigation: NEW. Homepage with ads enabled: TC-HOME-003.

## Gotchas
- Mobile `ft-loadmore`, `chevron-next`, `arrow-right` and `close` timed out in the crawl (covered or animated); use targeted specs.
- On the side-menu page every row except `close-sidebar`, `list-item-card`, `list-label-tentang-kumparan` and `close` timed out: the overlay covers the page.
- `hd-theme` is `moon` on mobile in `Header`.
- Interstitial ads may block clicks.

## Gaps
- Signed-in menu (profile, bookmarks, logout): pending signed-in crawl.
- "Tentang kumparan" and "Mode Gelap" outcomes not visible to the crawler.
- Carousel controls, footer links and breaking-news destinations beyond landing not covered.

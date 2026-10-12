# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agent\share\share.agent.spec.ts >> Share (agent) >> [TC-AGT-009] share modal closes with Escape like an accessible dialog
- Location: tests\agent\share\share.agent.spec.ts:82:3

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  getByTestId('modal-view')
Expected: hidden
Received: visible
Timeout:  10000ms

Call log:
  - Expect "toBeHidden" getByTestId('modal-view') with timeout 10000ms
  - waiting for getByTestId('modal-view')
    23 × locator resolved to <div data-qa-id="modal-view" class="Viewweb__StyledView-sc-b0snvl-0 enXYnN  flex">…</div>
       - unexpected value "visible"

```

```yaml
- text: Bagikan
- button "close":
  - img "close"
- button "sosmed-whatsapp-circle":
  - img "sosmed-whatsapp-circle"
- text: WhatsApp
- button "sosmed-facebook-circle":
  - img "sosmed-facebook-circle"
- text: Facebook
- button "sosmed-twitter-new-circle":
  - img "sosmed-twitter-new-circle"
- text: X
- button "sosmed-line-circle":
  - img "sosmed-line-circle"
- text: Line
- button "copy-circle":
  - img "copy-circle"
- text: Salin
- link "Laporkan Tulisan":
  - /url: /report/story/pintu-krl-bogor-line-gangguan-9-perjalanan-terlambat-hingga-32-menit-28LLu5FefNX
```

# Test source

```ts
  1   | // spec: specs/search-share-navigation.plan.md
  2   | // seed: tests/seed.spec.ts
  3   | import { test, expect } from '../../../src/fixtures';
  4   | import { ArticlePage } from '../../../src/pages/article.page';
  5   | 
  6   | test.describe('Share (agent)', { tag: ['@agent', '@share'] }, () => {
  7   |   // Review: planned and generated for kumparan.com (desktop); runs in the desktop project only
  8   |   // (see testIgnore in playwright.config.ts). Mobile agent specs are in tests/agent/mobile/.
  9   | 
  10  |   test('[TC-AGT-005] share bar whatsapp popup and copy link', async ({ home, article, page, context, browserName }) => {
  11  |     test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright');
  12  |     // 1. Open the first article from the homepage headline; scroll to share-wrapper.
  13  |     await home.open();
  14  |     await expect(home.headlineCards.first()).toBeVisible();
  15  |     // The card itself is not the link; its title is (same approach as TC-HOME-002).
  16  |     await home.headlineCards.first().getByTestId('title').first().click();
  17  |     await expect(article.title).toBeVisible();
  18  |     await article.shareBar.scrollIntoViewIfNeeded();
  19  |     await expect(article.shareWhatsApp).toBeVisible();
  20  |     await expect(article.shareCopyLink).toBeVisible();
  21  |     await expect(article.shareMore).toBeVisible();
  22  |     const headline = (await article.title.innerText()).trim();
  23  |     const articleUrl = page.url();
  24  | 
  25  |     // 2. Click sosmed-whatsapp and capture the popup; read its URL only.
  26  |     const popupUrl = new URL(await article.shareVia(article.shareWhatsApp));
  27  |     expect(popupUrl.hostname).toBe('api.whatsapp.com');
  28  |     const text = popupUrl.searchParams.get('text') ?? '';
  29  |     expect(text).toContain(headline.slice(0, 30));
  30  |     expect(text).toMatch(/https:\/\/kumparan\.com\/\S+/);
  31  | 
  32  |     // 3. Grant clipboard permissions, click copy-circle.
  33  |     await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  34  |     await article.shareCopyLink.click();
  35  |     await expect(article.copiedToast).toBeVisible();
  36  |     const copied = await page.evaluate(() => navigator.clipboard.readText());
  37  |     expect(copied).toMatch(/^https:\/\/kumparan\.com\//);
  38  |     // Share links use the short form /<channel>/<storyId>; compare channel and the 11-character story id.
  39  |     const articleSegments = new URL(articleUrl).pathname.replace(/\/full$/, '').split('/');
  40  |     const articleSlug = articleSegments.pop() ?? '';
  41  |     expect(new URL(copied).pathname).toBe(`${articleSegments.join('/')}/${ArticlePage.storyId(articleSlug)}`);
  42  |   });
  43  | 
  44  |   test('[TC-AGT-006] share more menu lists channels and closes; closing leaves article intact', async ({
  45  |     article,
  46  |     articlePath,
  47  |     search,
  48  |     page,
  49  |   }) => {
  50  |     // 1. On an article click more-vertical in share-wrapper.
  51  |     await article.open(articlePath);
  52  |     const headline = (await article.title.innerText()).trim();
  53  |     const urlBefore = page.url();
  54  |     let popups = 0;
  55  |     page.on('popup', () => popups++);
  56  |     await article.openShareMenu();
  57  |     for (const id of ['share-whatsapp', 'share-fb', 'share-twitter', 'share-line', 'share-copy-clipboard']) {
  58  |       await expect(article.shareModal.getByTestId(id)).toBeVisible();
  59  |     }
  60  | 
  61  |     // 2. Close the modal with its close button.
  62  |     // Review: the Escape check moved to its own known-defect test (TC-AGT-009),
  63  |     // so a mid-test fixme no longer skips the non-ASCII check below.
  64  |     await article.shareModal.getByTestId('btn-close-modal').click();
  65  |     await expect(article.shareModal).toBeHidden();
  66  |     await expect(page).toHaveURL(urlBefore);
  67  |     await expect(article.title).toHaveText(headline);
  68  |     expect(popups).toBe(0);
  69  | 
  70  |     // 3. Repeat on an article with a non-ASCII headline (search a term with accents).
  71  |     await search.open('café');
  72  |     await expect(search.results.first()).toBeVisible();
  73  |     await search.results.first().click();
  74  |     await expect(article.title).toBeVisible();
  75  |     const longHeadline = (await article.title.innerText()).trim();
  76  |     const shareUrl = new URL(await article.shareVia(article.shareWhatsApp));
  77  |     const text = shareUrl.searchParams.get('text') ?? '';
  78  |     expect(text).toContain(longHeadline.slice(0, 30));
  79  |     expect(text).toMatch(/https:\/\/kumparan\.com\/\S+/);
  80  |   });
  81  | 
  82  |   test(
  83  |     '[TC-AGT-009] share modal closes with Escape like an accessible dialog',
  84  |     {
  85  |       annotation: { type: 'issue', description: 'BUG-006: share modal ignores Escape and lacks dialog semantics' },
  86  |     },
  87  |     async ({ article, articlePath, page }) => {
  88  |       // Found by the healer agent; confirmed by hand on desktop and mobile (review).
  89  |       test.fail(true, 'Known defect BUG-006 still reproduces');
  90  |       await article.open(articlePath);
  91  |       await article.openShareMenu();
  92  | 
  93  |       await article.step('Press Escape');
  94  |       await page.keyboard.press('Escape');
  95  | 
> 96  |       await expect(article.shareModal).toBeHidden();
      |                                        ^ Error: expect(locator).toBeHidden() failed
  97  |     },
  98  |   );
  99  | });
  100 | 
```
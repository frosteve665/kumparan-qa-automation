// spec: specs/mobile.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '../../../src/fixtures';

test.describe('Mobile-specific navigation, share and guest login entry (agent)', { tag: ['@agent', '@mobile'] }, () => {
  test.skip(({ platform }) => platform !== 'mobile', 'Generated for m.kumparan.com');

  test('[TC-AGT-010] Burger side menu: open, check items, close', async ({ page, home, header }) => {
    // 1. Start from the seed state: home as guest, burger visible and drawer off-screen
    await home.open();
    const burger = page.getByTestId('burger-menu');
    const closeSidebar = page.getByTestId('close-sidebar');
    await expect(burger).toBeVisible();
    await expect(page.getByTestId('hamburger-menu')).toBeVisible();
    await expect(closeSidebar).not.toBeInViewport();

    // 2. Click burger-menu
    // Review: first open goes through header.openSideMenu(), which retries until the
    // page is interactive (a tap before that is swallowed; seen under parallel load).
    await header.openSideMenu();
    await expect(closeSidebar).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Menu' })).toBeVisible();
    await expect(page).toHaveURL('https://m.kumparan.com/');

    // 3. Check the top rows
    const login = page.getByTestId('anchor-login-wrapper');
    await expect(login).toContainText('Masuk');
    await expect(login.getByTestId('profile')).toBeVisible();
    await expect(page.getByTestId('label-list-item-berlangganan')).toContainText('Berlangganan');
    await expect(page.getByTestId('label-list-item-berlangganan')).toHaveAttribute('href', '/subscription');
    const darkMode = page.getByTestId('list-item-card').filter({ hasText: 'Mode Gelap' });
    await expect(darkMode).toBeVisible();
    await expect(darkMode.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByTestId('label-list-item-Informasi Kerja Sama')).toBeVisible();

    // 4. Check the navigation rows by href (not clicked)
    const navRows: Record<string, string> = {
      beranda: '/',
      'video story': '/video-story',
      'audio story': '/audio-story',
      'satu indonesia awards': '/topic/astra-satu-indonesia-awards',
      'green initiative': '/topic/green-initiative',
      trending: '/trending',
      'kabar daerah': '/kabar-daerah',
      'galeri foto': '/topic/galeri-foto',
      'opini & cerita': '/opini-cerita',
      'peringkat penulis': '/user-campaign',
    };
    for (const [name, href] of Object.entries(navRows)) {
      await expect(page.getByTestId(`label-list-item-${name}`)).toHaveAttribute('href', href);
    }
    await expect(page.getByTestId('label-list-item-audio story')).toContainText('Baru');

    // 5. Channel rows, footer links and version
    const channels: Record<string, string> = {
      news: 'news',
      entertainment: 'entertainment',
      mom: 'mom',
      'food & travel': 'food-travel',
      tekno: 'tekno',
      otomotif: 'otomotif',
      woman: 'woman',
      'bola & sports': 'bola-sports',
      bisnis: 'bisnis',
      bolanita: 'bolanita',
    };
    for (const [name, slug] of Object.entries(channels)) {
      await expect(page.getByTestId(`label-list-item-${name}`)).toHaveAttribute('href', `/channel/${slug}`);
    }
    await expect(page.getByTestId('label-cara-menulis')).toContainText('Cara Menulis di kumparan');
    const aboutRow = page.getByTestId('list-item-card').filter({ hasText: 'Tentang kumparan' });
    await expect(aboutRow).toBeAttached();
    await expect(aboutRow.getByRole('img', { name: 'chevron-down' })).toBeAttached();
    for (const social of ['instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'x']) {
      await expect(page.getByTestId(`label-list-item-${social}`)).toHaveAttribute('href', /^https:\/\//);
    }
    await expect(page.getByTestId('app-version')).toContainText('Version');

    // 6. Click close-sidebar
    await closeSidebar.click();
    await expect(closeSidebar).not.toBeInViewport();
    await expect(page).toHaveURL('https://m.kumparan.com/');

    // 7. Boundary: repeat open/close 3 times
    for (let i = 0; i < 3; i++) {
      await burger.click();
      await expect(closeSidebar).toBeInViewport();
      await closeSidebar.click();
      await expect(closeSidebar).not.toBeInViewport();
    }

    // 9. Final outcome assertions
    await expect(closeSidebar).not.toBeInViewport();
    expect(page.url()).toBe('https://m.kumparan.com/');
    await expect(burger).toBeVisible();
    await expect(burger).toBeEnabled();
  });

  test('[TC-AGT-011] Top-nav strip routes (nb-* items and topnav)', async ({ page, home }) => {
    // 1. Open home and assert the strip
    await home.open();
    await expect(page.getByTestId('nb-top-news')).toHaveText('Breaking News');
    await expect(page.getByTestId('nb-top-news')).toHaveAttribute('href', '/breakingnews');
    await expect(page.getByTestId('nb-video-story')).toHaveText('Video Story');
    await expect(page.getByTestId('nb-audio-story')).toHaveAttribute('href', '/audio-story');
    await expect(page.getByTestId('nb-trending')).toHaveAttribute('href', '/trending');
    await expect(page.getByTestId('topnav')).toHaveCount(10);

    // 2. Click nb-top-news
    await page.getByTestId('nb-top-news').click();
    await expect(page).toHaveURL('https://m.kumparan.com/breakingnews');
    await expect(page.getByTestId('burger-menu')).toBeVisible();
    await expect(page.getByTestId('hd-logo')).toBeVisible();

    // 3. Back to home, click nb-audio-story
    await home.open();
    await page.getByTestId('nb-audio-story').click();
    await expect(page).toHaveURL('https://m.kumparan.com/audio-story');
    await expect(page.getByTestId('burger-menu')).toBeVisible();

    // 4. Back to home, click nb-trending
    await home.open();
    await page.getByTestId('nb-trending').click();
    await expect(page).toHaveURL('https://m.kumparan.com/trending');
    await expect(page.getByTestId('tab-semua')).toBeVisible();
    await expect(page.getByTestId('trending-stories-card').first()).toBeVisible();
    await expect(page.getByTestId('burger-menu')).toBeVisible();
    await expect(page.getByTestId('hd-logo')).toBeVisible();

    // 6. Back to home, click the News channel in the top nav
    await home.open();
    await page.getByTestId('topnav').filter({ hasText: /^News$/ }).first().click();
    await expect(page).toHaveURL('https://m.kumparan.com/channel/news');
    // Review: the channel feed is fetched client-side after navigation (two GraphQL
    // calls); under parallel load it took >10 s once in 6 runs. Allow 20 s here.
    await expect(page.getByTestId('channel-feed-section').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('burger-menu')).toBeVisible();
    await expect(page.getByTestId('hd-logo')).toBeVisible();
  });

  test('[TC-AGT-012] Mobile share bar and share modal on an article', async ({ page, home }) => {
    // 1. From home click the first headline card
    await home.open();
    await page.getByTestId('headline-card').getByRole('link').first().click();
    await expect(page).toHaveTitle(/\| kumparan\.com/);
    const articleUrl = page.url();
    expect(articleUrl).toMatch(/^https:\/\/m\.kumparan\.com\/[^/]+\/.+/);

    // 2. Scroll share-wrapper into view and assert the inline icons
    const shareWrapper = page.getByTestId('share-wrapper').first();
    await shareWrapper.scrollIntoViewIfNeeded();
    await expect(shareWrapper).toBeVisible();
    await expect(shareWrapper.getByTestId('sosmed-instagram-circle')).toBeAttached();
    await expect(shareWrapper.getByTestId('sosmed-whatsapp-white')).toBeAttached();
    await expect(shareWrapper.getByTestId('copy-circle')).toBeAttached();
    await expect(shareWrapper.getByTestId('more-vertical')).toBeAttached();

    // 3. Click more-vertical
    await shareWrapper.getByTestId('more-vertical').click();
    const modal = page.getByTestId('modal-view');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('modal-header')).toContainText('Bagikan');
    await expect(page.getByTestId('btn-close-modal')).toBeVisible();

    // 4. Assert the six channels and the report link (not clicked)
    for (const id of ['share-ig', 'share-whatsapp', 'share-fb', 'share-twitter', 'share-line', 'share-copy-clipboard']) {
      await expect(modal.getByTestId(id)).toBeVisible();
    }
    for (const label of ['Stories', 'WhatsApp', 'Facebook', 'X', 'Line', 'Salin']) {
      await expect(modal).toContainText(label);
    }
    await expect(modal.getByTestId('btn-report')).toHaveAttribute('href', /^\/report\/story\//);

    // 5. Close the modal
    await page.getByTestId('btn-close-modal').click();
    await expect(modal).toHaveCount(0);
    await expect(shareWrapper).toBeVisible();
    await expect(page).toHaveURL(articleUrl);

    // 6. Boundary: reopen and close 2 times
    for (let i = 0; i < 2; i++) {
      await shareWrapper.getByTestId('more-vertical').click();
      await expect(modal).toBeVisible();
      await page.getByTestId('btn-close-modal').click();
      await expect(modal).toHaveCount(0);
    }

    // 8. Final outcome assertions
    await expect(shareWrapper).toBeVisible();
    expect(page.url()).toBe(articleUrl);
    expect(page.context().pages()).toHaveLength(1);
  });

  test('[TC-AGT-013] Guest login entry from the side menu (open form only, never submit)', async ({ page, home, header }) => {
    // 1. As a guest, open the burger menu (review: interactive-safe open, see TC-AGT-010)
    await home.open();
    await header.openSideMenu();
    await expect(page.getByTestId('close-sidebar')).toBeInViewport();

    // 2. Guest sees "Masuk" as the login row
    const loginRow = page.getByTestId('anchor-login-wrapper');
    await expect(loginRow).toBeVisible();
    await expect(loginRow).toContainText('Masuk');
    await expect(loginRow.getByTestId('profile')).toBeVisible();
    await expect(loginRow.getByTestId('label-text-masuk')).toBeVisible();

    // 3. Click the login row
    await loginRow.click();
    await expect(page).toHaveURL('https://m.kumparan.com/login');

    // 4. Assert the form fields and buttons (presence only)
    const email = page.getByTestId('input-email');
    const password = page.getByTestId('input-password');
    await expect(email).toBeVisible();
    await expect(email).toHaveValue('');
    await expect(password).toBeVisible();
    await expect(password).toHaveValue('');
    await expect(page.getByTestId('right-add-on')).toBeVisible();
    await expect(page.getByTestId('btn-forgot-password')).toHaveText('Lupa Password');
    await expect(page.getByTestId('btn-forgot-password')).toHaveAttribute('href', '/forgot-password');
    await expect(page.getByTestId('btn-register')).toHaveText('Daftar Sekarang!');
    await expect(page.getByTestId('btn-register')).toHaveAttribute('href', '/register');
    await expect(page.getByTestId('btn-login-fb')).toContainText('Facebook');
    await expect(page.getByTestId('btn-login-google')).toContainText('Google');
    await expect(page.getByTestId('btn-login-phone')).toContainText('Nomor Handphone');
    await expect(page.getByTestId('btn-save')).toContainText('Masuk');

    // 5. Toggle the eye icon twice without typing anything
    await page.getByTestId('right-add-on').click();
    await expect(password).toHaveAttribute('type', 'text');
    await page.getByTestId('right-add-on').click();
    await expect(password).toHaveAttribute('type', 'password');

    // 7. Final outcome assertions
    expect(page.url()).toBe('https://m.kumparan.com/login');
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(page.getByTestId('btn-save')).toBeVisible();
    await expect(page.getByTestId('btn-register')).toBeVisible();
    await expect(page.getByTestId('btn-forgot-password')).toBeVisible();
  });
});

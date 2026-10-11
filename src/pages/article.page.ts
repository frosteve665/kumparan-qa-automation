import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Header } from './header.component';

/** Parses counters like "12", "1,2rb" or "1.2K" into numbers. */
function parseCount(text: string): number {
  const clean = text.trim().toLowerCase().replace(',', '.');
  const n = Number.parseFloat(clean.replace(/[^\d.]/g, ''));
  if (Number.isNaN(n)) return 0;
  if (/rb|k/.test(clean)) return Math.round(n * 1_000);
  if (/jt|m/.test(clean)) return Math.round(n * 1_000_000);
  return n;
}

const COUNTER = /^\s*[\d.,]+\s*(rb|jt|k)?\s*$/i;

export class ArticlePage extends BasePage {
  readonly header = new Header(this.page, this.platform);

  readonly title = this.qa('story-title');
  readonly author = this.qa('story-author');
  readonly channel = this.qa('channel-name');
  readonly publishDate = this.qa('publish-date');
  readonly paragraphs = this.qa('story-paragraph');
  readonly breadcrumbHome = this.qa('home-breadcrumb');

  readonly likeButton = this.qa('btn-like');
  readonly commentButton = this.qa('btn-comment');
  readonly reportButton = this.qa('btn-report');
  readonly shareBar = this.qa('share-wrapper');
  readonly shareWhatsApp = this.shareBar.getByTestId('sosmed-whatsapp-white');
  readonly shareCopyLink = this.shareBar.getByTestId('copy-circle');
  readonly shareMore = this.shareBar.getByTestId('more-vertical');
  readonly shareModal = this.qa('modal-view');
  readonly shareModalClose = this.shareModal.getByTestId('btn-close-modal');
  readonly copiedToast = this.page.getByText('URL berhasil disalin');

  /** Share links use the 11-character story id at the end of the slug. */
  static storyId(articlePath: string): string {
    return articlePath.slice(-11);
  }

  async open(path: string): Promise<void> {
    await this.goto(path);
    await expect(this.title).toBeVisible();
    await this.waitForInteractive(this.likeButton);
  }

  /** Opens a path that may not be a story and returns the HTTP status. */
  async openMissing(path: string): Promise<number> {
    return this.goto(path);
  }

  async verifyOpen(articlePath: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(articlePath.split('/').pop()!));
    await expect(this.title).toBeVisible();
  }

  async headline(): Promise<string> {
    return (await this.title.innerText()).trim();
  }

  async verifyStoryContent(): Promise<void> {
    await expect(this.title).not.toBeEmpty();
    await expect(this.author).toBeVisible();
    await expect(this.channel).toBeVisible();
    await expect(this.publishDate).not.toBeEmpty();
    await expect(this.paragraphs.first()).not.toBeEmpty();
    expect(await this.paragraphs.count()).toBeGreaterThan(1);
  }

  async verifyHeadlineStartsWith(text: string): Promise<void> {
    await expect(this.title).toContainText(text);
  }

  async verifyEngagementBar(): Promise<void> {
    await expect(this.likeButton).toBeVisible();
    await expect(this.commentButton).toBeVisible();
    await expect(this.shareBar).toBeVisible();
    await expect(this.reportButton).toBeAttached();
    await expect(this.likeButton).toHaveText(COUNTER);
    await expect(this.commentButton).toHaveText(COUNTER);
  }

  async verifyPageTitleAndCanonical(articlePath: string): Promise<void> {
    const start = (await this.headline()).slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveTitle(new RegExp(`${start}.*\\| kumparan\\.com`));
    const slug = articlePath.split('/').pop()!;
    await expect(this.page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${slug}$`));
  }

  async goHomeViaBreadcrumb(): Promise<void> {
    await this.breadcrumbHome.click();
  }

  async likeCount(): Promise<number> {
    return parseCount(await this.likeButton.innerText());
  }

  async commentCount(): Promise<number> {
    return parseCount(await this.commentButton.innerText());
  }

  async verifyLikeCount(expected: number): Promise<void> {
    expect(await this.likeCount(), 'like count').toBe(expected);
  }

  /** A guest's like is answered with a redirect to login. */
  async tapLikeAsGuest(): Promise<void> {
    await this.clickUntilUrl(this.likeButton, /\/login/);
  }

  async openComments(): Promise<void> {
    await this.clickUntilUrl(this.commentButton, /\/response\//);
  }

  /** Waits for the form, not the URL: the URL can switch back to the story (BUG-002). */
  async openReport(): Promise<void> {
    await this.clickUntilVisible(this.reportButton, this.qa('radio-btn-option-report-0'));
  }

  /** Keyboard user: focus "Laporkan tulisan" (the page jumps to it) and press Enter. */
  async openReportWithKeyboard(): Promise<void> {
    await this.waitForInteractive(this.reportButton);
    await this.reportButton.focus();
    await this.page.keyboard.press('Enter');
  }

  async openShareMenu(): Promise<void> {
    await this.shareMore.click();
    await expect(this.shareModal).toBeVisible();
  }

  async closeShareMenu(): Promise<void> {
    await this.shareModalClose.click();
  }

  async verifyShareChannels(ids: readonly string[]): Promise<void> {
    for (const id of ids) await expect(this.shareModal.getByTestId(id)).toBeVisible();
  }

  async verifyShareMenuClosed(): Promise<void> {
    await expect(this.shareModal).toBeHidden();
  }

  /** Clicks a share icon and returns the URL of the popup it opens (stubbed, never loaded). */
  async shareVia(icon: Locator): Promise<string> {
    const popup = this.page.waitForEvent('popup');
    await icon.click();
    const target = await popup;
    const url = target.url();
    await target.close();
    return url;
  }

  async shareViaWhatsApp(): Promise<URL> {
    return new URL(await this.shareVia(this.shareWhatsApp));
  }

  async shareFromMenu(channelId: string): Promise<string> {
    return this.shareVia(this.shareModal.getByTestId(channelId));
  }

  /** The WhatsApp share text must hold the headline and the story's short link. */
  async verifyWhatsAppShareCarriesStory(articlePath: string): Promise<void> {
    const headline = await this.headline();
    const url = await this.shareViaWhatsApp();
    expect(url.hostname).toBe('api.whatsapp.com');
    const text = url.searchParams.get('text') ?? '';
    expect(text).toContain(headline.slice(0, 30));
    expect(text).toContain(this.shortLink(articlePath));
  }

  async verifyWhatsAppLinkIsAbsolute(): Promise<void> {
    const text = (await this.shareViaWhatsApp()).searchParams.get('text') ?? '';
    expect(/https?:\/\/\S+/.exec(text)?.[0] ?? '').toMatch(/^https:\/\/kumparan\.com\//);
  }

  async verifyMenuShare(channelId: string, host: RegExp, articlePath: string): Promise<void> {
    const url = await this.shareFromMenu(channelId);
    expect(url).toMatch(host);
    expect(decodeURIComponent(url)).toContain(ArticlePage.storyId(articlePath));
  }

  async verifyCopiedLinkPointsTo(articlePath: string): Promise<void> {
    const copied = await this.copyLink();
    expect(copied).toMatch(new RegExp(`^https://${this.shortLink(articlePath).replace(/\./g, '\\.')}\\?`));
  }

  /** kumparan.com/<channel>/<story-id>: the short link used by share and copy. */
  private shortLink(articlePath: string): string {
    return `kumparan.com/${articlePath.split('/')[1]}/${ArticlePage.storyId(articlePath)}`;
  }

  /** Copies the story link and returns what landed on the clipboard (Chromium only). */
  async copyLink(): Promise<string> {
    await this.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await this.shareCopyLink.click();
    await expect(this.copiedToast).toBeVisible();
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}

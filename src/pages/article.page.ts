import { expect, type Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Header } from './header.component';

/** Parses the number shown next to an icon ("1,2rb" / "1.2K" style values become numbers). */
export function parseCount(text: string): number {
  const clean = text.trim().toLowerCase().replace(',', '.');
  const n = Number.parseFloat(clean.replace(/[^\d.]/g, ''));
  if (Number.isNaN(n)) return 0;
  return /rb|k/.test(clean) ? Math.round(n * 1_000) : /jt|m/.test(clean) ? Math.round(n * 1_000_000) : n;
}

export class ArticlePage extends BasePage {
  readonly header = new Header(this.page, this.platform);

  get title(): Locator { return this.qa('story-title'); }
  get author(): Locator { return this.qa('story-author'); }
  get channel(): Locator { return this.qa('channel-name'); }
  get publishDate(): Locator { return this.qa('publish-date'); }
  get readingTime(): Locator { return this.qa('reading-time'); }
  get paragraphs(): Locator { return this.qa('story-paragraph'); }
  get heroImage(): Locator { return this.qa('image-figure'); }
  get topicTags(): Locator { return this.qa('tag-topic'); }
  get breadcrumbHome(): Locator { return this.qa('home-breadcrumb'); }

  get likeButton(): Locator { return this.qa('btn-like'); }
  get commentButton(): Locator { return this.qa('btn-comment'); }
  get reportButton(): Locator { return this.qa('btn-report'); }
  get shareBar(): Locator { return this.qa('share-wrapper'); }
  get shareWhatsApp(): Locator { return this.shareBar.getByTestId('sosmed-whatsapp-white'); }
  get shareCopyLink(): Locator { return this.shareBar.getByTestId('copy-circle'); }
  get shareMore(): Locator { return this.shareBar.getByTestId('more-vertical'); }
  get shareModal(): Locator { return this.qa('modal-view'); }
  /** Confirmation shown after "copy link". */
  get copiedToast(): Locator { return this.page.getByText('URL berhasil disalin'); }

  async open(path: string): Promise<void> {
    await this.goto(path);
    await expect(this.title).toBeVisible();
    await this.waitForInteractive(this.likeButton);
  }

  async likeCount(): Promise<number> {
    return parseCount(await this.likeButton.innerText());
  }

  async commentCount(): Promise<number> {
    return parseCount(await this.commentButton.innerText());
  }

  /** Whether the like icon is in its active state, read from the button's own markup. */
  async isLiked(): Promise<boolean> {
    return this.likeButton.evaluate((el) => {
      const html = el.outerHTML.toLowerCase();
      return el.getAttribute('aria-pressed') === 'true' || /like-fill|liked|active/.test(html);
    });
  }

  /** The 11-character story id at the end of the slug; share links use it as a short URL. */
  static storyId(articlePath: string): string {
    return articlePath.slice(-11);
  }

  // click() scrolls by itself and retries if the element is re-rendered.
  // No separate scrollIntoView: long desktop articles re-render while
  // scrolling (the URL switches to /full), which detaches a held handle.
  async toggleLike(): Promise<void> {
    await this.likeButton.click();
  }

  /**
   * Guest like: the app answers with a redirect to login.
   */
  async tapLikeExpectingLogin(): Promise<void> {
    await this.clickUntilUrl(this.likeButton, /\/login/);
  }

  async openComments(): Promise<void> {
    await this.clickUntilUrl(this.commentButton, /\/response\//);
  }

  /**
   * Waits for the form itself, not the URL: kumparan rewrites the address bar
   * back to the article (/full) while the form is shown (BUG-002).
   */
  async openReport(): Promise<void> {
    await this.clickUntilVisible(this.reportButton, this.page.getByTestId('radio-btn-option-report-0'));
  }

  async openShareMenu(): Promise<void> {
    await this.shareMore.click();
    await expect(this.shareModal).toBeVisible();
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
}

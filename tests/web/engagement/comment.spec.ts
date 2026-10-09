import { test, expect } from '../../../src/fixtures';

/** Comment thread as a guest. The send button is asserted, never clicked. */
test.describe('Comment as a guest', { tag: '@comment' }, () => {
  test('[TC-CMT-001] comment button opens the story comment thread', { tag: ['@smoke', '@p1', '@positive'] }, async ({ article, articlePath, comments, page }) => {
    await article.open(articlePath);
    const headline = (await article.title.innerText()).trim();

    await article.openComments();

    await expect(page).toHaveURL(new RegExp(`/response/${articlePath.split('/').pop()}`));
    await expect(comments.commentedStory).toContainText(headline.slice(0, 30));
    await expect(comments.editor).toHaveAttribute('placeholder', 'Tulis komentar...');
    await expect(comments.sendButton).toBeVisible();
  });

  test('[TC-CMT-002] comment count on the article matches the thread', { tag: ['@p2', '@positive', '@data'] }, async ({ article, articlePath, comments }) => {
    await article.open(articlePath);
    const countOnArticle = await article.commentCount();

    await article.openComments();

    await expect(comments.section).toContainText(`${countOnArticle} Komentar`);
    if (countOnArticle === 0) await expect(comments.emptyState).toHaveText(/Belum ada komentar/);
  });

  test('[TC-CMT-004] guest typing a comment publishes nothing', { tag: ['@p1', '@negative', '@authorization'] }, async ({ article, articlePath, comments, page }) => {
    await article.open(articlePath);
    await article.openComments();
    const writes: string[] = [];
    page.on('request', (r) => {
      const op = /"operationName"\s*:\s*"(\w+)"/.exec(r.postData() ?? '')?.[1];
      if (op && /comment|response/i.test(op) && /mutation/.test(r.postData() ?? '')) writes.push(op);
    });

    await comments.editor.fill('Komentar uji otomatis');

    await expect(comments.editor).toHaveValue('Komentar uji otomatis');
    await expect(page).toHaveURL(/\/response\//);
    expect(writes, 'no comment mutation while a guest types').toEqual([]);
    // OBS-001: a guest gets no login prompt while drafting; what "send" does
    // for a guest cannot be verified without sending (forbidden). See docs/findings.md.
    test.info().annotations.push({ type: 'observation', description: 'OBS-001: guest can draft a full comment with no login prompt' });
  });
});

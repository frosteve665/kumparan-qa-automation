import type { Page, TestInfo } from '@playwright/test';

/**
 * Evidence caption: a small banner rendered inside the page so every video explains itself:
 * test case, platform, current step and the live address-bar URL (videos do not show the
 * browser's address bar, and some findings are about the URL). pointer-events: none, so it can
 * never intercept a click; it sits in the top-right corner, away from the content under test.
 */
const CAPTION_ID = '__qa_caption';

interface CaptionArgs {
  captionId: string;
  header: string;
  title: string;
}

/** Runs inside the page. Idempotent: mounts once, then keeps the URL line current. */
function mountCaption({ captionId, header, title }: CaptionArgs): void {
  const mount = () => {
    if (document.getElementById(captionId)) return;
    const box = document.createElement('div');
    box.id = captionId;
    box.setAttribute('aria-hidden', 'true');
    const narrow = innerWidth < 600;
    box.style.cssText = [
      'position:fixed',
      'top:4px',
      'right:4px',
      'z-index:2147483647',
      `max-width:${narrow ? '62vw' : '440px'}`,
      'padding:4px 8px',
      'border-radius:6px',
      'background:rgba(17,24,39,.8)',
      'color:#fff',
      `font:${narrow ? '10px' : '12px'}/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif`,
      'pointer-events:none',
    ].join(';');
    box.innerHTML =
      '<div style="font-weight:700;letter-spacing:.02em"></div><div style="opacity:.9"></div>' +
      '<div data-step style="color:#86efac"></div><div data-url style="color:#93c5fd;word-break:break-all"></div>';
    const [h, t, s, u] = Array.from(box.children) as HTMLElement[];
    h!.textContent = header;
    t!.textContent = narrow ? '' : title;
    if (narrow) t!.style.display = 'none';
    s!.textContent = sessionStorage.getItem(captionId) ?? '';
    const showUrl = () => {
      const path = location.pathname.length > 48 ? `${location.pathname.slice(0, 45)}…` : location.pathname;
      u!.textContent = `URL ${location.host}${path}`;
      // React can rebuild the document on a fresh load and drop nodes it does not own.
      if (!box.isConnected) document.documentElement.appendChild(box);
    };
    showUrl();
    setInterval(showUrl, 250);
    document.documentElement.appendChild(box);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}

export async function installCaption(page: Page, testInfo: TestInfo): Promise<void> {
  const id = /\[(TC-[A-Z]+-\d{3})\]/.exec(testInfo.title)?.[1] ?? 'UNTRACKED';
  const args: CaptionArgs = {
    captionId: CAPTION_ID,
    header: `${id} · ${testInfo.project.name}`,
    title: testInfo.title.replace(/\[TC-[A-Z]+-\d{3}\]\s*/, ''),
  };
  await page.context().addInitScript(mountCaption, args);
  // Chromium does not run context init scripts in a same-site tab opened with window.open,
  // so new tabs get the caption mounted directly once they load.
  page.context().on('page', (tab) => {
    tab
      .waitForLoadState('domcontentloaded')
      .then(() => tab.evaluate(mountCaption, args))
      .catch(() => undefined);
  });
}

/** Updates the step line of the caption (survives navigations within the test). */
export async function captionStep(page: Page, step: string): Promise<void> {
  await page
    .evaluate(
      ({ captionId, step }) => {
        sessionStorage.setItem(captionId, step);
        const line = document.getElementById(captionId)?.querySelector('[data-step]');
        if (line) line.textContent = step;
      },
      { captionId: CAPTION_ID, step: `▶ ${step}` },
    )
    .catch(() => undefined);
}

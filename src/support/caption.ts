import type { Page, TestInfo } from '@playwright/test';

/**
 * Evidence caption: a small banner rendered inside the page so every video
 * explains itself ("TC-LIKE-004 · mobile-chrome · ▶ Tap btn-like").
 * pointer-events: none, so it can never intercept a click; it sits in the
 * top-right corner, away from the content under test.
 */
const CAPTION_ID = '__qa_caption';

export async function installCaption(page: Page, testInfo: TestInfo): Promise<void> {
  const id = /\[(TC-[A-Z]+-\d{3})\]/.exec(testInfo.title)?.[1] ?? 'UNTRACKED';
  const title = testInfo.title.replace(/\[TC-[A-Z]+-\d{3}\]\s*/, '');
  const header = `${id} · ${testInfo.project.name}`;
  await page.addInitScript(
    ({ captionId, header, title }) => {
      const mount = () => {
        if (document.getElementById(captionId)) return;
        const box = document.createElement('div');
        box.id = captionId;
        box.setAttribute('aria-hidden', 'true');
        const narrow = innerWidth < 600;
        box.style.cssText = [
          // Top-right corner: clear of the sticky engagement bar at the bottom of
          // mobile articles, which is often the very thing under test.
          'position:fixed',
          'top:4px',
          'right:4px',
          'z-index:2147483647',
          `max-width:${narrow ? '62vw' : '420px'}`,
          'padding:4px 8px',
          'border-radius:6px',
          'background:rgba(17,24,39,.78)',
          'color:#fff',
          `font:${narrow ? '10px' : '12px'}/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif`,
          'pointer-events:none',
        ].join(';');
        box.innerHTML =
          '<div style="font-weight:700;letter-spacing:.02em"></div><div style="opacity:.9"></div><div data-step style="color:#86efac"></div>';
        const [h, t, s] = Array.from(box.children) as HTMLElement[];
        h!.textContent = header;
        t!.textContent = narrow ? '' : title;
        if (narrow) t!.style.display = 'none';
        s!.textContent = sessionStorage.getItem(captionId) ?? '';
        document.documentElement.appendChild(box);
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
      else mount();
    },
    { captionId: CAPTION_ID, header, title },
  );
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

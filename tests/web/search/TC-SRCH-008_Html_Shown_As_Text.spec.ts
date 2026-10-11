import { test } from '../../../src/fixtures';
import { SEARCH } from '../../../src/data/search.data';

const CASE = '[TC-SRCH-008] HTML typed into search is shown as text, never rendered';

test(CASE, { tag: ['@p1'] }, async ({ home, search }) => {
  await home.open();
  await home.header.search(SEARCH.htmlProbe);

  await search.verifyUrl(/\/search\/%3Cb%3E/i);
  await search.verifyNotRenderedAsHtml(SEARCH.htmlProbeText);
});

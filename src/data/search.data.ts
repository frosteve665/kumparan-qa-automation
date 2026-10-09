export const SEARCH = {
  /** A common Indonesian news word: reliably returns results. */
  keyword: 'banjir',
  /** No story will ever match this. */
  nonsense: 'qzxwvkjhgf123zzq',
  /** Harmless markup probe for output encoding (read-only, nothing is stored). */
  htmlProbe: '<b>qaprobe</b>',
  htmlProbeText: 'qaprobe',
  longQuery: 'x'.repeat(200),
  emojiQuery: '🙂 banjir',
  ampersandQuery: 'food & travel',
  tabs: [
    { id: 'tab-video-story', path: 'video', resultCard: 'video-story-card' },
    { id: 'tab-kumparan_plus', path: 'collection', resultCard: 'collection-card' },
    { id: 'tab-topic', path: 'topik', resultCard: 'search-topic-result-card' },
    { id: 'tab-user', path: 'user', resultCard: 'search-user-result-card' },
    { id: 'tab-publisher', path: 'publisher', resultCard: 'search-publisher-result-card' },
  ],
} as const;

/** Channels in the share menu ("more" icon). */
export const SHARE_MENU_CHANNELS = [
  'share-whatsapp',
  'share-fb',
  'share-twitter',
  'share-line',
  'share-copy-clipboard',
] as const;

/** Share targets opened from the menu, with the host each must point to. */
export const SHARE_TARGETS = [
  { channel: 'share-fb', host: /facebook\.com/ },
  { channel: 'share-twitter', host: /(twitter|x)\.com/ },
  { channel: 'share-line', host: /line\.me/ },
] as const;

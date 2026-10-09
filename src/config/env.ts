import 'dotenv/config';

/** Single source of configuration; every value can be overridden from .env. */
export const env = {
  desktopBaseUrl: process.env.DESKTOP_BASE_URL ?? 'https://kumparan.com',
  mobileBaseUrl: process.env.MOBILE_BASE_URL ?? 'https://m.kumparan.com',
  graphqlUrl: process.env.GRAPHQL_URL ?? 'https://graphqlzero.almansi.me/api',
} as const;

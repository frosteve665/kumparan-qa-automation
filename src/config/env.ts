import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

/** Single source of configuration. Secrets come from .env locally and GitHub Secrets in CI. */
export const env = {
  get email() { return required('KUMPARAN_EMAIL'); },
  get password() { return required('KUMPARAN_PASSWORD'); },
  desktopBaseUrl: process.env.DESKTOP_BASE_URL ?? 'https://kumparan.com',
  mobileBaseUrl: process.env.MOBILE_BASE_URL ?? 'https://m.kumparan.com',
  graphqlUrl: process.env.GRAPHQL_URL ?? 'https://graphqlzero.almansi.me/api',
} as const;

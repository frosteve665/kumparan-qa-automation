/** Inputs that must fail client-side email validation (equivalence classes). */
export const INVALID_EMAILS = [
  'plainaddress', // no @ and no domain
  'user@', // missing domain
  '@kumparan.com', // missing local part
  'user@@kumparan.com', // double @
] as const;

export const LOGIN = {
  /** Syntactically valid but not a real account; never submitted (the bot challenge blocks it). */
  validFormatEmail: 'qa.automation.invalid@example.com',
  anyPassword: 'Not-A-Real-Password-1!',
} as const;
